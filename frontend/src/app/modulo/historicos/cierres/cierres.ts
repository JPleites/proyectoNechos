import { Component, OnInit , ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';

import { CierresService } from '../../services/cierres.services';

interface UsuarioCierre {
  codigo: number;
  rol: string;
}

interface CierreConsulta {
  id: number;
  cierreID: string;
  usuarioCodigo: number;
  fecha: string;

  totalEfectivo: number;
  totalBac: number;
  totalFicohsa: number;
  totalDavivienda: number;
  totalTransferencias: number;

  totalRetiros: number;
  totalDevoluciones: number;
  totalFacturado: number;
  totalRecibido: number;
  diferencia: number;

  usuario: UsuarioCierre;
}

@Component({
  selector: 'app-cierres',
  imports: [CommonModule, FormsModule],
  templateUrl: './cierres.html',
  styleUrl: './cierres.scss',
})
export class Cierres implements OnInit {

  cierres: CierreConsulta[] = [];

  cierreSeleccionado: CierreConsulta | null = null;

  cargando = false;

  filtros = {
    cierreID: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: '',
  };

  constructor(
    private readonly cierresService: CierresService,
    private readonly cdf: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCierres();
  }

  cargarCierres(): void {
    this.cargando = true;

    this.cierresService.getCierres().subscribe({
      next: (respuesta: any) => {
        this.cierres = respuesta as CierreConsulta[];
        this.cargando = false;
        this.cdf.detectChanges();
      },

      error: (error) => {
        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            error?.error?.message ||
            'No fue posible cargar los cierres.',
        });
      },
    });
  }

  /**
   * Convierte valores Decimal provenientes de Prisma
   * a números para poder mostrarlos correctamente.
   */
  numero(valor: any): number {
    return Number(valor || 0);
  }

  /**
   * Los filtros son locales por ahora.
   * El getter cierresFiltrados se encarga de aplicarlos.
   */
  buscar(): void {
    // Los filtros se aplican mediante cierresFiltrados.
  }

  limpiarFiltros(): void {
    this.filtros = {
      cierreID: '',
      usuario: '',
      fechaDesde: '',
      fechaHasta: '',
    };
  }

  get cierresFiltrados(): CierreConsulta[] {
    return this.cierres.filter((cierre) => {

      const cierreID =
        this.filtros.cierreID.trim().toLowerCase();

      const usuario =
        this.filtros.usuario.trim().toLowerCase();

      // Filtro por Cierre ID
      if (
        cierreID &&
        !cierre.cierreID.toLowerCase().includes(cierreID)
      ) {
        return false;
      }

      // Filtro por código de usuario
      if (
        usuario &&
        !String(cierre.usuarioCodigo)
          .toLowerCase()
          .includes(usuario)
      ) {
        return false;
      }

      // Filtro fecha desde
      if (this.filtros.fechaDesde) {

        const fechaCierre = new Date(cierre.fecha);

        const desde = new Date(
          `${this.filtros.fechaDesde}T00:00:00`
        );

        if (fechaCierre < desde) {
          return false;
        }
      }

      // Filtro fecha hasta
      if (this.filtros.fechaHasta) {

        const fechaCierre = new Date(cierre.fecha);

        const hasta = new Date(
          `${this.filtros.fechaHasta}T23:59:59`
        );

        if (fechaCierre > hasta) {
          return false;
        }
      }

      return true;
    });
  }

  verDetalle(cierre: CierreConsulta): void {
    this.cierreSeleccionado = cierre;
  }

  cerrarDetalle(): void {
    this.cierreSeleccionado = null;
  }

  abrirPdf(cierre: CierreConsulta): void {
    const url = this.cierresService.getPdfCierre(cierre.id);

    window.open(url, '_blank');
  }

  /**
   * Calcula el total de los medios de pago
   * registrados en el cierre.
   */
  totalMediosPago(cierre: CierreConsulta): number {
    return (
      this.numero(cierre.totalEfectivo) +
      this.numero(cierre.totalBac) +
      this.numero(cierre.totalFicohsa) +
      this.numero(cierre.totalDavivienda) +
      this.numero(cierre.totalTransferencias)
    );
  }

  /**
   * Clase visual según la diferencia del cierre.
   */
  claseDiferencia(diferencia: number): string {

    if (diferencia > 0) {
      return 'diferencia-favor';
    }

    if (diferencia < 0) {
      return 'diferencia-faltante';
    }

    return 'diferencia-exacta';
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
       XLSX.utils.book_append_sheet(wb, ws, 'Cierres');
       XLSX.writeFile(wb, 'reporte_cierres.xlsx');
     }
}
