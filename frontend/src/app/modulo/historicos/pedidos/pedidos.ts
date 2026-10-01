import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { PedidosService } from '../../services/pedidos.service';

interface PedidoDetalleConsulta {
  id: number;
  productoCodigo: string;
  ubicacion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;
  producto: {
    codigo: string;
    producto: string;
  };
  ubicacionRel?: {
    ubicacion: string;
    deposito: number;
    estante: number;
    nivel: number;
  };
}

interface PedidoConsulta {
  id: number;
  pedidoID: string;
  fecha: string;
  estado: string;
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;

  cliente: {
    id: number;
    clienteID?: string;
    nombre: string;
    rtn?: string;
  };

  usuario: {
    codigo: number;
    perfil: {
      nombre: string;
    };
  };

  detalles: PedidoDetalleConsulta[];
}

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class Pedidos {
  pedidos: PedidoConsulta[] = [];

  cargando = false;

  pedidoSeleccionado: PedidoConsulta | null = null;

  filtros = {
    pedidoID: '',
    cliente: '',
    estado: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: '',
  };

  constructor(private readonly pedidosService: PedidosService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;

    this.pedidosService.getPedidos().subscribe({
      next: (respuesta: any) => {
        this.pedidos = respuesta as PedidoConsulta[];
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message || 'No fue posible cargar los pedidos.',
        });
      },
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      pedidoID: '',
      cliente: '',
      estado: '',
      usuario: '',
      fechaDesde: '',
      fechaHasta: '',
    };

    this.buscar();
  }

  get pedidosFiltrados(): PedidoConsulta[] {
    return this.pedidos.filter((pedido) => {
      const pedidoID = this.filtros.pedidoID.trim().toLowerCase();

      const cliente = this.filtros.cliente.trim().toLowerCase();

      const usuario = this.filtros.usuario.trim().toLowerCase();

      if (pedidoID && !pedido.pedidoID.toLowerCase().includes(pedidoID)) {
        return false;
      }

      if (cliente && !pedido.cliente.nombre.toLowerCase().includes(cliente)) {
        return false;
      }

      if (usuario && !pedido.usuario.perfil.nombre.toLowerCase().includes(usuario)) {
        return false;
      }

      if (this.filtros.estado && pedido.estado !== this.filtros.estado) {
        return false;
      }

      if (this.filtros.fechaDesde) {
        const fechaPedido = new Date(pedido.fecha);
        const desde = new Date(`${this.filtros.fechaDesde}T00:00:00`);

        if (fechaPedido < desde) {
          return false;
        }
      }

      if (this.filtros.fechaHasta) {
        const fechaPedido = new Date(pedido.fecha);
        const hasta = new Date(`${this.filtros.fechaHasta}T23:59:59`);

        if (fechaPedido > hasta) {
          return false;
        }
      }

      return true;
    });
  }

  verDetalle(pedido: PedidoConsulta): void {
    this.pedidoSeleccionado = pedido;
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionado = null;
  }

  formatearEstado(estado: string): string {
    switch (estado) {
      case 'EN_PROCESO':
        return 'En proceso';

      case 'EN_CAJA':
        return 'En caja';

      case 'FACTURADO':
        return 'Facturado';

      case 'CANCELADO':
        return 'Cancelado';

      default:
        return estado;
    }
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'EN_PROCESO':
        return 'badge-estado proceso';

      case 'EN_CAJA':
        return 'badge-estado caja';

      case 'FACTURADO':
        return 'badge-estado facturado';

      case 'CANCELADO':
        return 'badge-estado cancelado';

      default:
        return 'badge-estado';
    }
  }
}
