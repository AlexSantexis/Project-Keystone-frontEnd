import { Injectable, inject } from '@angular/core';
import { environment } from '../../../enviroments/enviroment.development';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import {
  Basket,
  AddToBasketDTO,
  UpdateBasketItemDTO,
} from '../models/Basket.model';

const API_URL = `${environment.apiURL}/basket`;

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private http: HttpClient = inject(HttpClient);
  basketSubject = new BehaviorSubject<Basket | null>(null);
  basket$ = this.basketSubject.asObservable();

  constructor() {
    this.loadBasket();
  }

  private loadBasket(): void {
    this.getBasket().subscribe({
      next: (basket) => this.basketSubject.next(basket),
      error: (error) => console.error('Error loading basket', error),
    });
  }

  getBasket(): Observable<Basket> {
    return this.http.get<Basket>(API_URL);
  }

  addToBasket(item: AddToBasketDTO): Observable<Basket> {
    return this.http
      .post<Basket>(`${API_URL}/items/add`, item)
      .pipe(tap((basket) => this.basketSubject.next(basket)));
  }

  updateBasketItem(item: UpdateBasketItemDTO): Observable<Basket> {
    return this.http
      .post<Basket>(`${API_URL}/items/update`, item)
      .pipe(tap((basket) => this.basketSubject.next(basket)));
  }

  removeFromBasket(basketItemId: number): Observable<Basket> {
    return this.http
      .delete<Basket>(`${API_URL}/items/${basketItemId}`)
      .pipe(tap((basket) => this.basketSubject.next(basket)));
  }

  clearBasket(): Observable<any> {
    return this.http.delete(API_URL).pipe(
      tap(() => this.basketSubject.next(null)),
      catchError((error) => {
        console.error('Error clearing basket', error);
        return [];
      })
    );
  }
}
