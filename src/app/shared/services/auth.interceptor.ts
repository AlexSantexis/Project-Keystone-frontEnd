import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { UserService } from './UserService';

import { MessageService } from './MessageService';
import { TokenModel } from '../models/user';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private noAuthUrls: string[] = [
    '/api/Product/',
    '/api/Product/category/',
    '/api/Product/genre/',
    '/api/Product/details',
    '/api/Product/search',
  ];

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;
  userService = inject(UserService);
  messageService = inject(MessageService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.noAuthUrls.some((url) => req.url.includes(url))) {
      return next.handle(req);
    }

    const token = localStorage.getItem('access_token');

    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.userService.refreshToken().pipe(
        switchMap((token: TokenModel) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.accessToken);
          return next.handle(this.addToken(request, token.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.userService.logoutUser();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((jwt) => {
          if (jwt) {
            return next.handle(this.addToken(request, jwt));
          } else {
            this.userService.logoutUser();
            return throwError(() => new Error('No valid token available'));
          }
        })
      );
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
