import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConsultaVenta, FiltrosConsultaVentas, VentasService } from '../../services/ventas.service';
import * as XLSX from 'xlsx-js-style';

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

  constructor(
    private readonly ventasService: VentasService,
    private readonly cdRef: ChangeDetectorRef,
  ) {}

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
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
      XLSX.writeFile(wb, 'reporte_ventas.xlsx');
    }
}
