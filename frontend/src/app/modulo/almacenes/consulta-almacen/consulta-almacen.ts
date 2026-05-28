import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AlmacenesService } from '../../services/almacenes.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-almacen',
  imports: [CommonModule],
  templateUrl: './consulta-almacen.html',
  styleUrl: './consulta-almacen.scss',
})
export class ConsultaAlmacen implements OnInit {
  almacenes: any[] = [];

  constructor(private service: AlmacenesService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarAlmacenes();
  }

  cargarAlmacenes() {
    this.service.getAlmacenes().subscribe((data: any) => {
      this.almacenes = data;
      this.cdr.detectChanges();
    });
  }

  eliminarAlmacen(id: string) {

    Swal.fire({
      title: '¿Eliminar almacén?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {

      if (result.isConfirmed) {

        // loading ERP
        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        this.service.eliminarAlmacen(id).subscribe({
          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El almacén fue eliminado',
              timer: 1500,
              showConfirmButton: false
            });

            this.cargarAlmacenes();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el almacén'
            });
          }
        });

      }

    });
  }
}