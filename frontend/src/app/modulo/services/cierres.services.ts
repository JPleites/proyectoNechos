import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class CierresService {
  constructor(private api: ApiService) {}

  getCierres() {
    return this.api.get('/cierres');
  }

  cerrarCaja(data: any) {
    return this.api.post('/cierres/cerrar', data);
  }

  getArqueoHoy(usuarioCodigo: number) {
    return this.api.get(`/arqueo/hoy/${usuarioCodigo}`);
  }

  getPdfCierre(id: number): string {
    return `${this.api.baseUrl}/cierres/pdf/${id}`;
  }
  descargarPdfCierre(id: number) {
    return this.api.get(`/cierres/pdf/${id}`, { headers: { Accept: 'application/pdf' } });
  }
}
