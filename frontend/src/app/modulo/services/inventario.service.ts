import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {

  constructor(private apiService: ApiService) {}

  ingresar(data: any) {
    return this.apiService.post(`/inventario/ingreso`, data);
  }

  salida(data: any) {
    return this.apiService.post(`/inventario/salida`, data);
  }

  getInventario() {
    return this.apiService.get(`/inventario`);
  }

  getInventarioPorProducto(codigo: string) {
    return this.apiService.get(`/productos/${codigo}/inventario`);
  }

  getKardex(codigo: string) {
    return this.apiService.get(`/inventario/kardex/${codigo}`);
  }
}
