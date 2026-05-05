import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class UbicacionesService {
  constructor(private api: ApiService) {}

  getUbicaciones() {
    return this.api.get('/ubicaciones');
  }

  crearUbicacion(data: any) {
    return this.api.post('/ubicaciones', data);
  }

  eliminarUbicacion(id: string) {
    return this.api.delete(`/ubicaciones/${id}`);
  }
}