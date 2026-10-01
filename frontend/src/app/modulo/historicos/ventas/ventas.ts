import { CommonModule,  } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ConsultaVenta, FiltrosConsultaVentas, VentasService } from '../../services/ventas.service';
@Component({
  selector: 'app-ventas',
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas {
  ventas: ConsultaVenta[] = [];

  ventaSeleccionada: ConsultaVenta | null = null;

  cargando = false;

  mostrarDetalle = false;

  filtros: FiltrosConsultaVentas = {
    ventaID: '',
    cliente: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    tipoVenta: '',
    metodoPago: '',
  };

  constructor(private readonly ventasService: VentasService, private readonly cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buscar();
  }

  // =========================================================
  // BUSCAR
  // =========================================================

  buscar(): void {
    this.cargando = true;

    this.ventasService.consultarVentas(this.filtros).subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.cargando = false;
        this.cdRef.detectChanges();
      },

      error: (error) => {
        console.error('Error al consultar ventas:', error);
        this.ventas = [];
        this.cargando = false;
        this.cdRef.detectChanges();
      },
    });
  }

  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  limpiarFiltros(): void {
    this.filtros = {
      ventaID: '',
      cliente: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: '',
      tipoVenta: '',
      metodoPago: '',
    };

    this.buscar();
  }

  // =========================================================
  // VER DETALLE
  // =========================================================

  verDetalle(venta: ConsultaVenta): void {
    this.ventaSeleccionada = venta;
    this.mostrarDetalle = true;
  }

  // =========================================================
  // CERRAR DETALLE
  // =========================================================

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.ventaSeleccionada = null;
  }

  // =========================================================
  // FORMATO DE MONEDA
  // =========================================================

  formatearMoneda(valor: number | string): string {
    return Number(valor).toLocaleString('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
    });
  }

  // =========================================================
  // FORMATO DE FECHA
  // =========================================================

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-HN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  // =========================================================
  // CLASE DEL ESTADO
  // =========================================================

  claseEstado(estado: string): string {
    switch (estado) {
      case 'FACTURADA':
        return 'bg-success-subtle text-success';

      case 'CANCELADA':
        return 'bg-danger-subtle text-danger';

      case 'ANULADA':
        return 'bg-warning-subtle text-warning-emphasis';

      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }
}
