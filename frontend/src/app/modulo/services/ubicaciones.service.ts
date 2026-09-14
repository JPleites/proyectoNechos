import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Observable } from 'rxjs';

export interface Ubicacion {
  ubicacion: string;
  deposito: number;
  estante: number;
  nivel: number;
  almacenId: number;
}

@Injectable({
  providedIn: 'root',
})
export class UbicacionesService {
  constructor(private api: ApiService) {}

  getUbicaciones(): Observable<Ubicacion[]> {
    return this.api.get<Ubicacion[]>('/ubicaciones');
  }

  crearUbicacion(data: any) {
    return this.api.post('/ubicaciones', data);
  }

  eliminarUbicacion(id: string) {
    return this.api.delete(`/ubicaciones/${id}`);
  }
}