import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private apiUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  ingresar(data: any) {
    return this.http.post(`${this.apiUrl}inventario/ingreso`, data);
  }

  salida(data: any) {
    return this.http.post(`${this.apiUrl}inventario/salida`, data);
  }

  getInventario() {
    return this.http.get(`${this.apiUrl}inventario`);
  }

  getInventarioPorProducto(codigo: string) {
    return this.http.get(`${this.apiUrl}productos/${codigo}/inventario`);
  }

  getKardex(codigo: string) {
    return this.http.get(`${this.apiUrl}inventario/kardex/${codigo}`);
  }
}
