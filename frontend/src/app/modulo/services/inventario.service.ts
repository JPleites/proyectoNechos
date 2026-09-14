import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  consultaInventario(params: any) {
    return this.apiService.get('/inventario/consulta', { params });
  }

  getInventarioPorProducto(codigo: string) {
    return this.apiService.get(`/productos/${codigo}/inventario`);
  }

  getKardex(codigo?: string, ubicacion?: string) {
  let params = new URLSearchParams();

  if (codigo) {
    params.set('codigo', codigo);
  }

  if (ubicacion) {
    params.set('ubicacion', ubicacion);
  }

  const query = params.toString();

  return this.apiService.get(
    `/inventario/kardex${query ? '?' + query : ''}`
  );
}

  getUbicacionesDisponibles(almacenId: number, codigo: string) {
    return this.apiService.get(
      `/inventario/ubicaciones-disponibles?productoCodigo=${codigo}&almacenId=${almacenId}`,
    );
  }
}
