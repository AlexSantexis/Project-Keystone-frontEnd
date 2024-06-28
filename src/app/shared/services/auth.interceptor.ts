import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { UserService } from './UserService';
import { TokenModel } from '../models/user';
import { MessageService } from './MessageService';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private noAuthUrls: string[] = [
    '/api/Product/',
    '/api/Product/category/',
    '/api/Product/genre/',
    '/api/Product/details',
    '/api/Product/search',
  ];
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  userService = inject(UserService);
  messageService = inject(MessageService);
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.noAuthUrls.some((url) => req.url.includes(url))) {
      return next.handle(req);
    }

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      req = this.addToken(req, accessToken);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private isTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return true;
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    const isExpired = Math.floor(new Date().getTime() / 1000) >= expiry;

    if (isExpired) {
      this.messageService.setMessage({
        type: 'info',
        text: 'Your session is about to expire. Please refresh the page to continue.',
      });
    }

    return isExpired;
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.userService.refreshToken().pipe(
        switchMap((response: TokenModel) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addToken(request, response.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.userService.logoutUser();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((accessToken) => {
          return next.handle(this.addToken(request, accessToken));
        })
      );
    }
  }
}
