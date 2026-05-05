import { Component, OnInit } from '@angular/core';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-ubicaciones',
  imports: [CommonModule],
  templateUrl: './consulta-ubicaciones.html',
  styleUrl: './consulta-ubicaciones.scss',
})
export class ConsultaUbicaciones implements OnInit {
  ubicaciones: any[] = [];

  constructor(private ubicacionesService: UbicacionesService) {}

  ngOnInit() {
    this.cargarUbicaciones();
  }

  cargarUbicaciones() {
    this.ubicacionesService.getUbicaciones().subscribe((data: any) => {
      this.ubicaciones = data;
    });
  }

  eliminar(id: string) {
    Swal.fire({
      title: '¿Eliminar ubicación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.ubicacionesService.eliminarUbicacion(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminada',
              timer: 1500,
              showConfirmButton: false,
            });

            this.cargarUbicaciones();
          },

          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Error al eliminar', 'error');
          },
        });
      }
    });
  }
}
