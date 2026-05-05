import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {

  constructor(private apiService: ApiService) {}

  getProductos() {
    return this.apiService.get(`/productos`);
  }

  getProducto(codigo: string) {
    return this.apiService.get(`/productos/${codigo}`);
  }

  createProducto(data: any) {
    return this.apiService.post(`/productos`, data);
  }

  updateProducto(codigo: string, data: any) {
    return this.apiService.put(`/productos/${codigo}`, data);
  }

  deleteProducto(codigo: string) {
    return this.apiService.delete(`/productos/${codigo}`);
  }

  buscarProductos(query: string) {
    return this.apiService.get(`/productos/buscar?q=${query}`);
  }
}
