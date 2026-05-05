import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  constructor(private api: ApiService) {}

  getProveedores() {
    return this.api.get('/proveedores');
  }

  crearProveedor(data: any) {
    return this.api.post('/proveedores', data);
  }

  eliminarProveedor(rtn: string) {
    return this.api.delete(`/proveedores/${rtn}`);
  }
}
