import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DevolucionesService, Devolucion, FiltrosDevoluciones } from '../../services/devoluciones';
import * as XLSX from 'xlsx-js-style';

@Component({
  selector: 'app-devoluciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './devoluciones.html',
  styleUrl: './devoluciones.scss',
})
export class Devoluciones {
  devoluciones: Devolucion[] = [];

  cargando = false;

  filtros: FiltrosDevoluciones = {
    devolucionID: '',
    ventaID: '',
    cliente: '',
    producto: '',
    fechaDesde: '',
    fechaHasta: '',
    fueUsada: '',
  };
  devolucionSeleccionada: Devolucion | null = null;
  mostrarModal = false;

  constructor(
    private readonly devolucionesService: DevolucionesService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

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

  @ViewChild('tablaExportar', { static: false }) tablaExportar!: ElementRef;

  exportar(): void {
      //Convertimos la tabla HTML en una hoja de trabajo
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tablaExportar.nativeElement);
  
      //Recorremos todas las celdas para dar formato, centrar, quitar la última columna y blindar textos/fechas
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // Ocultamos/eliminamos la última columna (la de "Acciones" que no va en Excel)
        // Reducimos el índice máximo de columnas (e.c) en 1 para que ignore la última
        if (range.e.c > range.s.c) {
          range.e.c = range.e.c - 1;
          ws['!ref'] = XLSX.utils.encode_range(range); // Actualizamos el rango de la hoja
        }
  
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cellAddress];
            
            if (cell) {
              // Inicializamos el objeto de estilos si no existe
              if (!cell.s) {
                cell.s = {};
              }
  
              // Centramos todo (horizontal y verticalmente)
              cell.s.alignment = {
                horizontal: 'center',
                vertical: 'center'
              };
  
              if (cell.v !== undefined && cell.v !== null) {
                const valorStr = String(cell.v).trim();
                
                // Evitar notación científica en números largos y arreglar FECHAS raras
                const esFecha = valorStr.includes('-') || valorStr.includes('/');
                const esNumeroLargo = /^\d{6,}$/.test(valorStr) || (typeof cell.v === 'number' && valorStr.length > 5);
  
                if (esFecha || esNumeroLargo) {
                  cell.t = 's'; // Forzamos a que Excel lo lea estrictamente como Texto
                  cell.v = valorStr;
                }
              }
            }
          }
        }
      }
  
      //Creamos el libro de trabajo y guardamos el archivo
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
      XLSX.writeFile(wb, 'reporte_devoluciones.xlsx');
    }
}
