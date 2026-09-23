import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

export interface Inventario {
  id: number;
  productoCodigo: string;
  ubicacion: string;
  cantidad: number;
  cantidadReservada?: number;
}

export interface InventarioConsulta extends Inventario {
  producto?: {
    codigo: string;
    producto: string;
  };
  ubicacionRel?: {
    ubicacion: string;
    deposito: number;
    estante: number;
    nivel: number;
    almacenId: number;
  };
}

export interface UbicacionDisponible {
  ubicacion: string;
  deposito: number;
  estante: number;
  nivel: number;
  almacenId: number;
}

export interface UbicacionTransferencia {
  ubicacion: string;
  deposito: number;
  estante: number;
  nivel: number;
  almacenId: number;
  cantidad: number;
  cantidadReservada: number;
  cantidadDisponible: number;
}

export interface TransferenciaInventario {
  productoCodigo: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  cantidad: number;
  referencia?: string;
}

export interface TransferenciaRespuesta {
  mensaje: string;
  productoCodigo: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  cantidad: number;

  inventarioOrigen: {
    ubicacion: string;
    cantidad: number;
  };

  inventarioDestino: {
    ubicacion: string;
    cantidad: number;
  };

  movimiento: {
    id: number;
    tipo: string;
    cantidad: number;
    ubicacionOrigen: string;
    ubicacionDestino: string;
    referencia: string | null;
    usuarioCodigo: number;
    fecha: string;
  };
}

export interface SalidaInventario {
  productoCodigo: string;
  ubicacion: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  constructor(private apiService: ApiService) {}

  ingresar(data: any): Observable<any> {
    return this.apiService.post('/inventario/ingreso', data);
  }

  salida(data: SalidaInventario): Observable<any> {
    return this.apiService.post<any>('/inventario/salida', data);
  }

  getInventario(): Observable<Inventario[]> {
    return this.apiService.get<Inventario[]>('/inventario');
  }

  consultaInventario(params: any): Observable<InventarioConsulta[]> {
    return this.apiService.get<InventarioConsulta[]>('/inventario/consulta', { params });
  }

  getInventarioPorProducto(codigo: string): Observable<Inventario[]> {
    return this.apiService.get<Inventario[]>(`/productos/${codigo}/inventario`);
  }

  transferirProducto(data: TransferenciaInventario): Observable<TransferenciaRespuesta> {
    return this.apiService.post<TransferenciaRespuesta>('/inventario/transferencia', data);
  }

  getKardex(codigo?: string, ubicacion?: string): Observable<any> {
    const params: any = {};

    if (codigo) {
      params.codigo = codigo;
    }

    if (ubicacion) {
      params.ubicacion = ubicacion;
    }

    return this.apiService.get<any>('/inventario/kardex', { params });
  }

  getUbicacionesDisponibles(almacenId: number, codigo: string): Observable<UbicacionDisponible[]> {
    return this.apiService.get<UbicacionDisponible[]>('/inventario/ubicaciones-disponibles', {
      params: {
        productoCodigo: codigo,
        almacenId,
      },
    });
  }

  getUbicacionesTransferencia(
    almacenId: number,
    codigo: string,
  ): Observable<UbicacionTransferencia[]> {
    return this.apiService.get<UbicacionTransferencia[]>('/inventario/ubicaciones-transferencia', {
      params: {
        productoCodigo: codigo,
        almacenId,
      },
    });
  }
}
