import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProveedoresService {
  constructor(private api: ApiService) {}

  getProveedores(): Observable<any[]> {
    return this.api.get<any[]>('/proveedores');
  }

  crearProveedor(data: any): Observable<any> {
    return this.api.post<any>('/proveedores', data);
  }

  eliminarProveedor(rtn: string): Observable<any> {
    return this.api.delete(`/proveedores/${rtn}`);
  }
}
