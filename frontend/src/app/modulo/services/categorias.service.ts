import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  constructor(private api: ApiService) {}

  getCategorias(): Observable<any[]> {
    return this.api.get<any[]>('/categorias');
  }

  getSubCategorias(categoriaId: number): Observable<any[]> {
    return this.api.get<any[]>(`/categorias/${categoriaId}/subcategorias`);
  }

  createSubCategoria(categoriaId: number, data: any): Observable<any> {
    return this.api.post(`/categorias/${categoriaId}/subcategorias`, data);
  }

  eliminarSubCategoria(subId: number): Observable<any> {
  return this.api.delete(`/categorias/subcategorias/${subId}`);
}

  crearCategoria(data: any): Observable<any> {
    return this.api.post<any>('/categorias', data);
  }

  eliminarCategoria(id: string): Observable<any> {
    return this.api.delete(`/categorias/${id}`);
  }

  asignarProveedor(categoriaId: string, proveedorRtn: string): Observable<any> {
    return this.api.post(`/categorias/${categoriaId}/proveedores`, {
      proveedorRtn,
    });
  }

  quitarProveedor(categoriaId: string, rtn: string): Observable<any> {
    return this.api.delete(`/categorias/${categoriaId}/proveedores/${rtn}`);
  }
}
