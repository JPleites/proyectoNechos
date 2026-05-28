import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-clientes',
  imports: [CommonModule, RouterLink],
  templateUrl: './consulta-clientes.html',
  styleUrl: './consulta-clientes.scss',
})
export class ConsultaClientes implements OnInit {
  clientes: any[] = [];

  constructor(private service: ClientesService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getClientes().subscribe((data: any) => {
      this.clientes = data;
      this.cdRef.detectChanges();
    });
  }

  eliminar(id: string) {
    Swal.fire({
      title: '¿Eliminar cliente?',
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

        this.service.eliminarCliente(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Cliente eliminado',
              timer: 1500,
              showConfirmButton: false,
            });

            this.cargar();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
          },
        });
      }
    });
  }
}
