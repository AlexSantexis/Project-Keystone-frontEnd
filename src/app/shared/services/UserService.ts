import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, effect, signal } from '@angular/core';
import { environment } from '../../../enviroments/enviroment.development';
import {
  LoggedInUser,
  User,
  Credentials,
  TokenModel,
  PasswordChangeModel,
  UserDetailed,
} from '../models/user';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { MessageService } from './MessageService';

const API_URL = `${environment.apiURL}/auth`;
const API_ADMIN_URL = `${environment.apiURL}/user`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http: HttpClient = inject(HttpClient);
  user = signal<LoggedInUser | null>(null);
  router: Router = inject(Router);
  messageService: MessageService = inject(MessageService);

  constructor() {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      this.setUserFromToken(access_token);
    }
    effect(() => {
      if (this.user()) {
        console.log('User logged in', this.user()?.Email);
      } else {
        console.log('No user logged in');
      }
    });
  }

  refreshToken(): Observable<TokenModel> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http
      .post<TokenModel>(`${API_URL}/refresh-token`, {
        accessToken: localStorage.getItem('access_token'),
        refreshToken,
      })
      .pipe(
        tap((tokens: TokenModel) => {
          this.setTokens(tokens.accessToken, tokens.refreshToken);
        }),
        catchError((error) => {
          this.logoutUser();
          return throwError(() => error);
        })
      );
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.setUserFromToken(accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  setUserFromToken(token: string) {
    const decodedToken = jwtDecode<LoggedInUser & { sub: string }>(token);
    this.user.set({
      userId: decodedToken.sub,
      Email: decodedToken.Email,
      Firstname: decodedToken.Firstname,
      Lastname: decodedToken.Lastname,
    });
  }

  registerUser(user: User) {
    return this.http.post<{ msg: string }>(`${API_URL}/register`, user).pipe(
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Registration failed',
        });
        return throwError(() => error);
      })
    );
  }

  // updateUser(user: User) {
  //   return this.http
  //     .post<{ msg: string; token: string }>(`${API_URL}/update`, user)
  //     .pipe(
  //       catchError((error) => {
  //         this.messageService.setMessage({
  //           type: 'error',
  //           text: error.error.message || 'Update failed',
  //         });
  //         return throwError(() => error);
  //       })
  //     );
  // }
  updateUser(user: User & { currentEmail: string }) {
    return this.http
      .post<{ msg: string; token: string }>(`${API_URL}/update`, user)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.setTokens(response.token, this.getRefreshToken() || '');
          }
        }),
        catchError((error) => {
          this.messageService.setMessage({
            type: 'error',
            text: error.error.message || 'Update failed',
          });
          return throwError(() => error);
        })
      );
  }

  loginUser(credentials: Credentials): Observable<TokenModel> {
    return this.http.post<TokenModel>(`${API_URL}/login`, credentials).pipe(
      tap((response: TokenModel) => {
        this.setTokens(response.accessToken, response.refreshToken);
      }),
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Login failed',
        });
        return throwError(() => error);
      })
    );
  }

  logoutUser() {
    this.user.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.messageService.setMessage({
      type: 'info',
      text: 'You have been logged out',
    });
    this.router.navigate(['/account/login']);
  }

  deleteUser(email: string) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { email },
    };
    return this.http.delete<{ msg: string }>(`${API_URL}/delete`, options).pipe(
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Delete failed',
        });
        return throwError(() => error);
      })
    );
  }

  changePassword(
    passwordChangeModel: PasswordChangeModel
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${API_URL}/change-password`,
        passwordChangeModel
      )
      .pipe(
        catchError((response) => {
          let errorMessage = 'An error occurred while changing the password';
          if (response.error && response.error.message) {
            errorMessage = response.error.message;
          }
          this.messageService.setMessage({
            type: 'error',
            text: errorMessage,
          });
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${API_URL}/me`).pipe(
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Failed to get current user',
        });
        return throwError(() => error);
      })
    );
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = jwtDecode<any>(token);
      return (
        decodedToken[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] === 'Admin'
      );
    }
    return false;
  }

  //New Additions
  getAllUsers(): Observable<UserDetailed[]> {
    return this.http.get<UserDetailed[]>(`${API_ADMIN_URL}`).pipe(
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Failed to retrieve users',
        });
        return throwError(() => error);
      })
    );
  }

  getUserById(userId: string): Observable<UserDetailed> {
    return this.http.get<UserDetailed>(`${API_ADMIN_URL}/${userId}`).pipe(
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Failed to retrieve user',
        });
        return throwError(() => error);
      })
    );
  }

  updateUserById(
    userId: string,
    userDto: UserDetailed
  ): Observable<UserDetailed> {
    return this.http
      .post<UserDetailed>(`${API_ADMIN_URL}/${userId}`, userDto)
      .pipe(
        catchError((error) => {
          this.messageService.setMessage({
            type: 'error',
            text: error.error.message || 'Failed to update user',
          });
          return throwError(() => error);
        })
      );
  }

  deleteUserById(userId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${API_ADMIN_URL}/${userId}`).pipe(
      catchError((error) => {
        this.messageService.setMessage({
          type: 'error',
          text: error.error.message || 'Failed to delete user',
        });
        return throwError(() => error);
      })
    );
  }
}
