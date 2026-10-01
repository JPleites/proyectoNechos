import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DevolucionesService, Devolucion, FiltrosDevoluciones } from '../../services/devoluciones';

@Component({
  selector: 'app-devoluciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './devoluciones.html',
  styleUrl: './devoluciones.scss',
})
export class Devoluciones {
  devoluciones: Devolucion[] = [];

  cargando = false;

  // =========================================================
  // FILTROS
  // =========================================================

  filtros: FiltrosDevoluciones = {
    devolucionID: '',
    ventaID: '',
    cliente: '',
    producto: '',
    fechaDesde: '',
    fechaHasta: '',
    fueUsada: '',
  };

  // =========================================================
  // MODAL
  // =========================================================

  devolucionSeleccionada: Devolucion | null = null;
  mostrarModal = false;

  constructor(private readonly devolucionesService: DevolucionesService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    if (
      this.filtros.fechaDesde &&
      this.filtros.fechaHasta &&
      this.filtros.fechaDesde > this.filtros.fechaHasta
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text: 'La fecha desde no puede ser posterior a la fecha hasta.',
      });

      return;
    }

    this.cargando = true;

    this.devolucionesService.consultarDevoluciones(this.filtros).subscribe({
      next: (respuesta) => {
        this.devoluciones = respuesta;
        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        this.cargando = false;

        console.error('Error al consultar devoluciones:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message ?? 'No fue posible consultar las devoluciones.',
        });
      },
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      devolucionID: '',
      ventaID: '',
      cliente: '',
      producto: '',
      fechaDesde: '',
      fechaHasta: '',
      fueUsada: '',
    };

    this.buscar();
  }

  verDetalle(devolucion: Devolucion): void {
    this.devolucionSeleccionada = devolucion;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.devolucionSeleccionada = null;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-HN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  formatearMoneda(valor: number): string {
    return Number(valor).toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  getEstadoUso(devolucion: Devolucion): string {
    return devolucion.fueUsada ? 'Utilizada' : 'Disponible';
  }
}
