import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';
import { Wishlist } from '../models/wishlist';
import { MessageService } from './MessageService';

const API_URL = `${environment.apiURL}/wishlist`;

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  http: HttpClient = inject(HttpClient);
  messageService: MessageService = inject(MessageService);

  getWishlist(): Observable<Wishlist> {
    return this.http
      .get<Wishlist>(`${API_URL}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http
      .post(`${API_URL}/add/${productId}`, {})
      .pipe(catchError((error) => this.handleError(error)));
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.http
      .delete(`${API_URL}/remove/${productId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    let errorMessage = 'Something bad happened; please try again later.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error.message || errorMessage;
    }
    this.messageService.setMessage({ type: 'error', text: errorMessage });
    return throwError(() => new Error(errorMessage));
  }
}
