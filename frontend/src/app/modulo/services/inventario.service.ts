import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
  ) {}

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
    return this.http.get('/inventario/consulta', { params });
  }

  getInventarioPorProducto(codigo: string) {
    return this.apiService.get(`/productos/${codigo}/inventario`);
  }

  getKardex(codigo: string) {
    return this.apiService.get(`/inventario/kardex/${codigo}`);
  }

  getUbicacionesDisponibles(almacenId: number, codigo: string) {
    return this.apiService.get(
      `/inventario/ubicaciones-disponibles?productoCodigo=${codigo}&almacenId=${almacenId}`,
    );
  }
}
