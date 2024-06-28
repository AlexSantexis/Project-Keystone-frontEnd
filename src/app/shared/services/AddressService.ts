
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment.development';
import { Address } from '../models/address.mode';

const API_URL = `${environment.apiURL}/address`;
@Injectable({
  providedIn: 'root',
})
export class AddressService {
  http: HttpClient = inject(HttpClient);

  getAddress(): Observable<Address> {
    return this.http.get<Address>(API_URL);
  }

  addAddress(address: Address): Observable<any> {
    return this.http.post(`${API_URL}/add`, address);
  }

  updateAddress(address: Partial<Address>): Observable<any> {
    return this.http.post(`${API_URL}/update`, address);
  }

  removeAddress(): Observable<any> {
    return this.http.delete(API_URL);
  }
}
