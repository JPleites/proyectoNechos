import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface VentaDevolucion {
  id: number;
  ventaID: string;
  clienteID: number;

  cliente: {
    id: number;
    nombre: string;
  };

  fecha: string;
  estado: string;
  tipoVenta: string;

  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;

  detalles: DetalleVentaDevolucion[];
}

export interface DetalleVentaDevolucion {
  id: number;
  productoCodigo: string;
  nombreProducto: string;

  cantidad: number;
  cantidadDevuelta: number;
  cantidadDisponible: number;

  precioUnitario: number;
  subtotal: number;
  descuento: number;

  producto?: {
    codigo: string;
    producto: string;
  };
}

export interface Devolucion {
  id: number;
  devolucionID: string;

  ventaId: number;
  ventaID?: string;

  productoCodigo: string;
  producto: string;

  cantidad: number;
  motivo: string;

  fecha: string;

  PrecioUnitario: number;
  valorDevolucion: number;

  fueUsada: boolean;

  usuarioCodigo: number;
  usuario: string;

  cliente: string;
}

export interface CrearDevolucion {
  ventaId: number;
  productoCodigo: string;
  cantidad: number;
  motivo: string;
}

export interface FiltrosDevoluciones {
  devolucionID?: string;
  ventaID?: string;
  cliente?: string;
  producto?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  fueUsada?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DevolucionesService {
  private readonly endpoint = '/devoluciones';

  constructor(private readonly api: ApiService) {}

  obtenerVentaParaDevolucion(ventaId: number) {
    return this.api.get<VentaDevolucion>(`/ventas/${ventaId}/devolucion`);
  }

  crearDevolucion(data: CrearDevolucion) {
    return this.api.post<Devolucion>(this.endpoint, data);
  }

  obtenerDevoluciones() {
    return this.api.get<Devolucion[]>(this.endpoint);
  }

  obtenerDevolucion(devolucionID: string) {
    return this.api.get<Devolucion>(`${this.endpoint}/${devolucionID}`);
  }

  consultarDevoluciones(filtros: FiltrosDevoluciones) {
    const params: any = {};

    if (filtros.devolucionID?.trim()) {
      params.devolucionID = filtros.devolucionID.trim();
    }

    if (filtros.ventaID?.trim()) {
      params.ventaID = filtros.ventaID.trim();
    }

    if (filtros.cliente?.trim()) {
      params.cliente = filtros.cliente.trim();
    }

    if (filtros.producto?.trim()) {
      params.producto = filtros.producto.trim();
    }

    if (filtros.fechaDesde) {
      params.fechaDesde = filtros.fechaDesde;
    }

    if (filtros.fechaHasta) {
      params.fechaHasta = filtros.fechaHasta;
    }

    if (filtros.fueUsada !== undefined && filtros.fueUsada !== '') {
      params.fueUsada = filtros.fueUsada;
    }

    return this.api.get<Devolucion[]>(`${this.endpoint}/consulta`, { params });
  }
}
