import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class SolicitudDescuentoService {
  constructor(private api: ApiService) {}

  getPendientes() {
    return this.api.get('/solicitudes-descuento/pendientes');
  }

  getSolicitud(id: number) {
    return this.api.get(`/solicitudes-descuento/${id}`);
  }

  aprobar(id: number) {
    return this.api.post(`/solicitudes-descuento/${id}/aprobar`, {});
  }

  rechazar(id: number, motivo?: string) {
    return this.api.post(`/solicitudes-descuento/${id}/rechazar`, {
      motivo: motivo?.trim() || undefined,
    });
  }
}
