import { Component, OnInit } from '@angular/core';
import { ProveedoresService } from '../../services/proveedores.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-proveedores',
  imports: [CommonModule],
  templateUrl: './consulta-proveedores.html',
  styleUrl: './consulta-proveedores.scss',
})
export class ConsultaProveedores implements OnInit {
  proveedores: any[] = [];

  constructor(private service: ProveedoresService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
    });
  }

  eliminar(rtn: string) {

  Swal.fire({
    title: '¿Eliminar proveedor?',
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

      Swal.fire({
        title: 'Eliminando...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.service.eliminarProveedor(rtn).subscribe({
        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            timer: 1500,
            showConfirmButton: false
          });

          this.cargar();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
        }
      });

    }

  });
}
}
