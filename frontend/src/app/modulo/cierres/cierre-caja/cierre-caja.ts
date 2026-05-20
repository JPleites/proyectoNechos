import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CierresService } from '../../services/cierres.services';

@Component({
  selector: 'app-cierre-caja',
  imports: [CommonModule, FormsModule],
  templateUrl: './cierre-caja.html',
  styleUrl: './cierre-caja.scss',
})
export class CierreCaja implements OnInit {
  arqueo: any = null;
  efectivoContado = 0;
  bacContado = 0;
  ficohsaContado = 0;
  daviviendaContado = 0;
  transferenciaContado = 0;
  diferencias: any = {
    efectivo: 0,
    bac: 0,
    ficohsa: 0,
    davivienda: 0,
    transferencia: 0,
    total: 0,
  };
  usuarioCodigo = 1; // luego lo sacas del token

  constructor(private cierresService: CierresService) {}

  ngOnInit() {
    this.cargarArqueo();
  }

  cargarArqueo() {
    this.cierresService.getArqueoHoy(this.usuarioCodigo).subscribe({
      next: (data: any) => {
        this.arqueo = data;
        this.calcularDiferencia();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar arqueo', 'error');
      },
    });
  }

  calcularDiferencia() {
    if (!this.arqueo) return;

    this.diferencias.efectivo = this.efectivoContado - Number(this.arqueo.totalEfectivo);

    this.diferencias.bac = this.bacContado - Number(this.arqueo.totalBac);

    this.diferencias.ficohsa = this.ficohsaContado - Number(this.arqueo.totalFicohsa);

    this.diferencias.davivienda = this.daviviendaContado - Number(this.arqueo.totalDavivienda);

    this.diferencias.transferencia =
      this.transferenciaContado - Number(this.arqueo.totalTransferencias);

    this.diferencias.total = Number(
      this.diferencias.efectivo +
        this.diferencias.bac +
        this.diferencias.ficohsa +
        this.diferencias.davivienda +
        this.diferencias.transferencia,
    );
  }

  cerrarCaja() {
    Swal.fire({
      title: '¿Cerrar caja?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
    }).then((res) => {
      if (!res.isConfirmed) return;

      const payload = {
        usuarioCodigo: this.usuarioCodigo,

        efectivoContado: this.efectivoContado,
        bacContado: this.bacContado,
        ficohsaContado: this.ficohsaContado,
        daviviendaContado: this.daviviendaContado,
        transferenciaContado: this.transferenciaContado,

        totalRecibido:
          this.efectivoContado +
          this.bacContado +
          this.ficohsaContado +
          this.daviviendaContado +
          this.transferenciaContado,

        diferencia: this.diferencias.total,
      };

      this.cierresService.cerrarCaja(payload).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Caja cerrada', 'success');

          this.descargarPdf();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cerrar caja', 'error');
        },
      });
    });
  }

  descargarPdf() {
    this.cierresService.getPdfCierre(this.usuarioCodigo).subscribe((res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cierre-caja.pdf';
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}
