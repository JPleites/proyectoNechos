import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

export interface ConsultaVenta {
  id: number;
  ventaID: string;
  fecha: string;
  estado: string;
  tipoVenta: string;

  cliente: {
    id: number;
    clienteID: string;
    nombre: string;
    rtn: string;
  };

  usuario: {
    codigo: number;
    nombre: string;
    cargo: string;
  };

  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;

  metodoPago: string;
  totalRecibido: number;
  cambio: number;

  detalles: DetalleConsultaVenta[];
}

export interface DetalleConsultaVenta {
  id: number;
  productoCodigo: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;

  producto: {
    codigo: string;
    producto: string;
  };
}

export interface FiltrosConsultaVentas {
  ventaID?: string;
  cliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  tipoVenta?: string;
  metodoPago?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private readonly endpoint = '/ventas';

  constructor(private readonly api: ApiService) {}

  consultarVentas(
    filtros: FiltrosConsultaVentas = {},
  ): Observable<ConsultaVenta[]> {
    const params: any = {};

    if (filtros.ventaID?.trim()) {
      params.ventaID = filtros.ventaID.trim();
    }

    if (filtros.cliente?.trim()) {
      params.cliente = filtros.cliente.trim();
    }

    if (filtros.fechaDesde) {
      params.fechaDesde = filtros.fechaDesde;
    }

    if (filtros.fechaHasta) {
      params.fechaHasta = filtros.fechaHasta;
    }

    if (filtros.estado) {
      params.estado = filtros.estado;
    }

    if (filtros.tipoVenta) {
      params.tipoVenta = filtros.tipoVenta;
    }

    if (filtros.metodoPago) {
      params.metodoPago = filtros.metodoPago;
    }

    return this.api.get<ConsultaVenta[]>(
      `${this.endpoint}/consulta`,
      { params },
    );
  }
}