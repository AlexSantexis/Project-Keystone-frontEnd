import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderDTO, OrderDTO } from '../models/order.model';
import { environment } from '../../../enviroments/enviroment.development';

const API_URL = `${environment.apiURL}/orders`;
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  getOrdersByUserEmail(email: string): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${API_URL}/user/${email}`);
  }

  createOrder(createOrderDTO: CreateOrderDTO): Observable<OrderDTO> {
    return this.http.post<OrderDTO>(API_URL, createOrderDTO);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  getOrderById(id: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${API_URL}/${id}`);
  }
}
