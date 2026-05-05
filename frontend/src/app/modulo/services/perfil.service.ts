import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  constructor(private apiService: ApiService) {}

  createPerfil(data: any) {
    return this.apiService.post(`/perfil`, data);
  }

  getPerfiles() {
    return this.apiService.get(`/perfil`);
  }

  deletePerfil(id: number) {
    return this.apiService.delete(`/perfil/${id}`);
  }

  crearUsuario(id: number, data: any) {
    return this.apiService.post(`/perfil/${id}/usuario`, data);
  }

  getPerfil(id: number) {
    return this.apiService.get(`/perfil/${id}`);
  }
}
