import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { SolicitudDescuentoService } from '../../services/solicitud-descuento';

@Component({
  selector: 'app-consulta-descuentos',
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-descuentos.html',
  styleUrl: './consulta-descuentos.scss',
})
export class ConsultaDescuentos {
  solicitudes: any[] = [];
  solicitudesFiltradas: any[] = [];

  busqueda = '';
  filtroNivel = '';

  cargando = false;

  constructor(
    private solicitudDescuentoService: SolicitudDescuentoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando = true;

    this.solicitudDescuentoService.getPendientes().subscribe({
      next: (data: any) => {
        this.solicitudes = Array.isArray(data) ? data : [];
        this.aplicarFiltros();

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar solicitudes:', err);

        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las solicitudes de descuento.',
        });
      },
    });
  }

  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.solicitudesFiltradas = this.solicitudes.filter((solicitud) => {
      const coincideTexto =
        !texto ||
        String(solicitud.solicitudID ?? '')
          .toLowerCase()
          .includes(texto) ||
        String(solicitud.pedido?.pedidoID ?? '')
          .toLowerCase()
          .includes(texto) ||
        String(solicitud.producto?.codigo ?? '')
          .toLowerCase()
          .includes(texto) ||
        String(solicitud.producto?.producto ?? '')
          .toLowerCase()
          .includes(texto) ||
        String(solicitud.vendedor?.perfil?.nombre ?? '')
          .toLowerCase()
          .includes(texto);

      const coincideNivel = !this.filtroNivel || solicitud.nivelAprobacion === this.filtroNivel;

      return coincideTexto && coincideNivel;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroNivel = '';
    this.aplicarFiltros();
  }

  aprobarSolicitud(solicitud: any): void {
    Swal.fire({
      icon: 'question',
      title: '¿Aprobar descuento?',
      html: `
        <div class="text-start">
          <p class="mb-2">
            <strong>Pedido:</strong>
            ${solicitud.pedido?.pedidoID ?? '—'}
          </p>

          <p class="mb-2">
            <strong>Producto:</strong>
            ${solicitud.producto?.producto ?? '—'}
          </p>

          <p class="mb-0">
            <strong>Descuento:</strong>
            Lps. ${this.formatearNumero(solicitud.descuentoSolicitado)}
            (${this.formatearNumero(solicitud.porcentajeSolicitado)}%)
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-success px-4 ms-2',
        cancelButton: 'btn btn-light border px-4',
      },
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.procesarAprobacion(solicitud);
    });
  }

  private procesarAprobacion(solicitud: any): void {
    Swal.fire({
      title: 'Procesando...',
      text: 'Aprobando solicitud',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.solicitudDescuentoService.aprobar(solicitud.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Solicitud aprobada',
          text: 'El descuento fue aprobado correctamente.',
          timer: 1800,
          showConfirmButton: false,
        });

        this.cargarSolicitudes();
      },

      error: (err) => {
        console.error('Error al aprobar solicitud:', err);

        Swal.fire({
          icon: 'error',
          title: 'No se pudo aprobar',
          text: err?.error?.message ?? 'Ocurrió un error al aprobar la solicitud.',
        });
      },
    });
  }

  rechazarSolicitud(solicitud: any): void {
    Swal.fire({
      title: 'Rechazar solicitud',
      text: 'Indica el motivo del rechazo.',
      input: 'textarea',
      inputPlaceholder: 'Escribe el motivo del rechazo...',
      inputAttributes: {
        'aria-label': 'Motivo del rechazo',
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar solicitud',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-danger px-4 ms-2',
        cancelButton: 'btn btn-light border px-4',
      },

      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debes indicar un motivo para rechazar la solicitud.';
        }

        return null;
      },
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.procesarRechazo(solicitud, result.value.trim());
    });
  }

  private procesarRechazo(solicitud: any, motivo: string): void {
    Swal.fire({
      title: 'Procesando...',
      text: 'Rechazando solicitud',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.solicitudDescuentoService.rechazar(solicitud.id, motivo).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Solicitud rechazada',
          text: 'La solicitud fue rechazada correctamente.',
          timer: 1800,
          showConfirmButton: false,
        });

        this.cargarSolicitudes();
      },

      error: (err) => {
        console.error('Error al rechazar solicitud:', err);

        Swal.fire({
          icon: 'error',
          title: 'No se pudo rechazar',
          text: err?.error?.message ?? 'Ocurrió un error al rechazar la solicitud.',
        });
      },
    });
  }

  formatearNumero(valor: any): string {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return '0.00';
    }

    return numero.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  get totalPendientes(): number {
    return this.solicitudes.length;
  }

  get totalSupervisorAdmin(): number {
    return this.solicitudes.filter((s) => s.nivelAprobacion === 'SUPERVISOR_ADMIN').length;
  }

  get totalAdmin(): number {
    return this.solicitudes.filter((s) => s.nivelAprobacion === 'ADMIN').length;
  }
}
