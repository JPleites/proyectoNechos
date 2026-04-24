import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private apiUrl = 'http://localhost:3000/perfil';
  constructor(private http: HttpClient) {}

  createPerfil(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getPerfiles() {
    return this.http.get(this.apiUrl);
  }

  deletePerfil(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  crearUsuario(id: number, data: any) {
    return this.http.post(`${this.apiUrl}/${id}/usuario`, data);
  }

  getPerfil(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
