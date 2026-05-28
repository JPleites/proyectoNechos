import { Injectable } from '@angular/core';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  constructor(private api: ApiService) {}

  getPedidos() {
    return this.api.get('/pedidos');
  }

  getPedido(id: number) {
    return this.api.get(`/pedidos/${id}`);
  }

  crearPedido(data: any) {
    return this.api.post('/pedidos', data);
  }

  agregarDetalle(pedidoId: number, data: any) {
    return this.api.post(`/pedidos/${pedidoId}/detalle`, data);
  }

  eliminarDetalle(detalleId: number) {
    return this.api.delete(`/pedidos/detalle/${detalleId}`);
  }

  actualizarDetalle(detalleId: number, cantidad: number) {
    return this.api.put(`/pedidos/detalle/${detalleId}`, { cantidad });
  }

  deletePedido(id: number) {
    return this.api.delete(`/pedidos/${id}`);
  }

  enviarACaja(id: number) {
    return this.api.put(`/pedidos/${id}/caja`, {});
  }

  getPedidosEnCaja() {
    return this.api.get('/pedidos/en-caja');
  }

  facturarPedido(id: number, data: any) {
    return this.api.post(`/ventas/${id}/facturar`, data);
  }

  cerrarCaja(data: any) {
    return this.api.post('/pedidos/cerrar-caja', data);
  }

  getArqueoHoy(usuarioCodigo: number) {
    return this.api.get(`/arqueo/hoy/${usuarioCodigo}`);
  }
}
