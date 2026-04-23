import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private baseUrl = 'http://localhost:3000/productos';

  constructor(private http: HttpClient) {}

  getProductos() {
    return this.http.get<any[]>(this.baseUrl);
  }

  getProducto(codigo: string) {
    return this.http.get(`${this.baseUrl}/${codigo}`);
  }

  createProducto(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  updateProducto(codigo: string, data: any) {
    return this.http.put(`${this.baseUrl}/${codigo}`, data);
  }

  deleteProducto(codigo: string) {
    return this.http.delete(`${this.baseUrl}/${codigo}`);
  }

  buscarProductos(query: string) {
    return this.http.get(`${this.baseUrl}/buscar?q=${query}`);
  }
}
