import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  constructor(private api: ApiService) {}

  getCategorias() {
    return this.api.get('/categorias');
  }

  crearCategoria(data: any) {
    return this.api.post('/categorias', data);
  }

  eliminarCategoria(id: string) {
    return this.api.delete(`/categorias/${id}`);
  }

  asignarProveedor(categoriaId: string, proveedorRtn: string) {
    return this.api.post(`/categorias/${categoriaId}/proveedores`, {
      proveedorRtn,
    });
  }

  quitarProveedor(categoriaId: string, rtn: string) {
    return this.api.delete(`/categorias/${categoriaId}/proveedores/${rtn}`);
  }
}
