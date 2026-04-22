import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 🔹 LOGIN
  login(data: any) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  // 🔹 PRODUCTOS
  getProductos() {
    return this.http.get(`${this.baseUrl}/productos`);
  }
}
