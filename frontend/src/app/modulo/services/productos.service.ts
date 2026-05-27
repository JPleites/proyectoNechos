import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';

export interface Producto {
  codigo: string;
  producto: string;
  precio: number;
  marca?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(private apiService: ApiService) {}

  getProductos(): Observable<Producto[]> {
    return this.apiService.get<Producto[]>('/productos');
  }

  getProducto(codigo: string): Observable<Producto> {
    return this.apiService.get<Producto>(`/productos/${codigo}`);
  }

  createProducto(data: any): Observable<Producto> {
    return this.apiService.post<Producto>('/productos', data);
  }

  updateProducto(codigo: string, data: any): Observable<Producto> {
    return this.apiService.put<Producto>(`/productos/${codigo}`, data);
  }

  deleteProducto(codigo: string): Observable<any> {
    return this.apiService.delete<any>(`/productos/${codigo}`);
  }

  buscarProductos(query: string): Observable<Producto[]> {
    return this.apiService.get<Producto[]>(`/productos/buscar?q=${query}`);
  }

  getUbicaciones(productoCodigo: string, almacenId: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/productos/ubicaciones/${productoCodigo}/${almacenId}`);
  }

  filtrosProductos(filtros: any) {
    const params = new URLSearchParams();

    if (filtros.q) params.append('q', filtros.q);
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.proveedorId) params.append('proveedorId', filtros.proveedorId);
    if (filtros.marcaId) params.append('marcaId', filtros.marcaId);

    return this.apiService.get(`/productos/filtros?${params.toString()}`);
  }
}
