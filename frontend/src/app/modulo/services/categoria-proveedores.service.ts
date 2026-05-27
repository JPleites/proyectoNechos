import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriaProveedoresService {
  constructor(private api: ApiService) {}

  // 🔍 Obtener categorías asignadas a un proveedor
  getCategoriasProveedor(proveedorId: number): Observable<any[]> {
    return this.api.get<any[]>(`/categoria-proveedores/${proveedorId}`);
  }

  // 💾 Asignar (reemplazar) categorías a un proveedor
  asignarCategorias(data: {
    proveedorId: number;
    categorias: number[];
  }) {
    return this.api.post('/categoria-proveedores', data);
  }
}