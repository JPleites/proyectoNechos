import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';

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

  @ViewChild('tablaExportar', { static: false }) tablaExportar!: ElementRef;

  exportar(): void {
    //Convertimos la tabla HTML en una hoja de trabajo
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tablaExportar.nativeElement);

    //Recorremos todas las celdas para limpiar, centrar, quitar la última columna y blindar fechas/números
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      if (range.e.c > range.s.c) {
        range.e.c = range.e.c - 1;
        ws['!ref'] = XLSX.utils.encode_range(range);
      }

      // Obtenemos las filas reales del elemento DOM de la tabla para leer el texto exacto que ve el usuario
      const tableElement: HTMLTableElement = this.tablaExportar.nativeElement;
      const rows = tableElement.querySelectorAll('tr');

      for (let R = range.s.r; R <= range.e.r; ++R) {
        // Intentamos leer el texto directo de la celda en el HTML si existe la fila
        const tr = rows[R];
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          
          if (cell) {
            if (!cell.s) {
              cell.s = {};
            }

            // Centramos todo (horizontal y verticalmente)
            cell.s.alignment = {
              horizontal: 'center',
              vertical: 'center'
            };

            if (tr && tr.cells[C]) {
              const textoVisual = tr.cells[C].innerText.trim();
              if (textoVisual !== '') {
                cell.t = 's'; // Forzamos a que Excel lo guarde estrictamente como TEXTO plano
                cell.v = textoVisual;
              }
            } else if (cell.v !== undefined && cell.v !== null) {
              // Respaldo 
              const valorStr = String(cell.v).trim();
              const esFecha = valorStr.includes('-') || valorStr.includes('/');
              const esNumeroLargo = /^\d{6,}$/.test(valorStr) || (typeof cell.v === 'number' && valorStr.length > 5);

              if (esFecha || esNumeroLargo) {
                cell.t = 's';
                cell.v = valorStr;
              }
            }
          }
        }
      }
    }

    //Creamos el libro de trabajo y guardamos el archivo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    XLSX.writeFile(wb, 'reporte_pedidos.xlsx');
  }
}
