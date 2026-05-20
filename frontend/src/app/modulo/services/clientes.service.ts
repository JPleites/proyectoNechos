import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private apiService: ApiService) {}

  getClientes() {
    return this.apiService.get('/clientes');
  }

  getCliente(id: string) {
    return this.apiService.get(`/clientes/${id}`);
  }

  crearCliente(data: any) {
    return this.apiService.post('/clientes', data);
  }

  eliminarCliente(id: string) {
    return this.apiService.delete(`/clientes/${id}`);
  }

  editarCliente(id: string, data: any) {
    return this.apiService.put(`/clientes/${id}`, data);
  }
}
