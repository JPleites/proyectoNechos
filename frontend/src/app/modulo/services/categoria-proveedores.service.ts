import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class CategoriaProveedoresService {
  constructor(private api: ApiService) {}

  // 🔍 Obtener categorías asignadas a un proveedor
  getCategoriasProveedor(rtn: string) {
    return this.api.get(`/categoria-proveedores/${rtn}`);
  }

  // 💾 Asignar (reemplazar) categorías a un proveedor
  asignarCategorias(data: {
    proveedorRtn: string;
    categorias: string[];
  }) {
    return this.api.post('/categoria-proveedores', data);
  }
}