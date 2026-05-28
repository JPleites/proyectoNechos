import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-pedidos',
  imports: [CommonModule],
  templateUrl: './consulta-pedidos.html',
  styleUrl: './consulta-pedidos.scss',
})
export class ConsultaPedidos implements OnInit {
  pedidos: any[] = [];

  constructor(private service: PedidosService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.service.getPedidos().subscribe((data: any) => {
      this.pedidos = data;
      this.cdr.detectChanges();
    });
  }

  enviarACaja(id: number) {
    this.service.enviarACaja(id).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Pedido enviado a caja', 'success');

        this.cargarPedidos();
      },
      error: (err) => {
        console.error(err);

        Swal.fire('Error', 'No se pudo enviar', 'error');
      },
    });
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar pedido?',
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

        this.service.deletePedido(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Pedido eliminado',
              timer: 1500,
              showConfirmButton: false,
            });

            this.cargarPedidos();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
          },
        });
      }
    });
  }

  cancelarPedido(id : number){
    //Para Cancelar el pedido, no borrarlo
  }
}
