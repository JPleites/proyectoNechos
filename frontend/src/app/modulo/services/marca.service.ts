import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class MarcaService {
  constructor(private api: ApiService) {}

  getMarcas() {
    return this.api.get('/marcas');
  }

  getPorProveedor(id: number) {
    return this.api.get(`/marcas/proveedor/${id}`);
  }

  createMarca(data: any) {
    return this.api.post('/marcas', data);
  }

  getMarcasPorProveedor(proveedorId: number) {
    return this.api.get(`/marcas/proveedor/${proveedorId}`);
  }
}
