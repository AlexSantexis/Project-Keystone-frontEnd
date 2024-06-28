import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../enviroments/enviroment.development';
import { MessageService } from './MessageService';

const API_URL = `${environment.apiURL}/Product`; 

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http: HttpClient = inject(HttpClient);
  private messageService: MessageService = inject(MessageService);

  getProductById(productId: number): Observable<Product> {
    return this.http
      .get<Product>(`${API_URL}/${productId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  createProduct(product: FormData): Observable<Product> {
    return this.http
      .post<Product>(API_URL, product)
      .pipe(catchError((error) => this.handleError(error)));
  }

  updateProduct(
    productId: number,
    product: Partial<Product>
  ): Observable<Product> {
    return this.http
      .post<Product>(`${API_URL}/update/${productId}`, product)
      .pipe(catchError((error) => this.handleError(error)));
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http
      .delete<void>(`${API_URL}/${productId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getProductsByCategory(
    categoryId: number,
    page: number = 1,
    pageSize: number = 10
  ): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${API_URL}/category/${categoryId}`, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  getProductsByGenre(
    genreId: number,
    page: number = 1,
    pageSize: number = 10
  ): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${API_URL}/genre/${genreId}`, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  getProductWithDetails(
    page: number = 1,
    pageSize: number = 10
  ): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${API_URL}/details`, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  searchProductsByName(searchTerm: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${API_URL}/search`, {
        params: { searchTerm },
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  filterAndSortProducts(
    sortOrder: string = 'asc',
    page: number = 1,
    pageSize: number = 10,
    genreName?: string,
    categoryName?: string
  ): Observable<Product[]> {
    let params = new HttpParams()
      .set('sortOrder', sortOrder)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (genreName) {
      params = params.set('genreName', genreName);
    }
    if (categoryName !== undefined) {
      params = params.set('categoryName', categoryName);
    }

    return this.http
      .get<Product[]>(`${API_URL}/filter`, { params })
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
