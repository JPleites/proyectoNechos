import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../services/pedidos.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-pedidos.html',
  styleUrl: './consulta-pedidos.scss',
})
export class ConsultaPedidos implements OnInit {
  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  metodoPago = 'EFECTIVO';
  totalRecibido: number = 0;

  constructor(private pedidosService: PedidosService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.getPedidosEnCaja().subscribe({
      next: (data: any) => {
        this.pedidos = data;
      },
      error: (err) => console.error(err),
    });
  }

  seleccionarPedido(pedido: any) {
    this.pedidoSeleccionado = pedido;
  }

  get cambio(): number {
    if (!this.pedidoSeleccionado) return 0;
    return this.totalRecibido - Number(this.pedidoSeleccionado.total);
  }

  facturar() {
  if (!this.pedidoSeleccionado) return;

  if (this.totalRecibido < Number(this.pedidoSeleccionado.total)) {
    Swal.fire('Error', 'El monto recibido es insuficiente', 'warning');
    return;
  }

  this.pedidosService
    .facturarPedido(this.pedidoSeleccionado.id, {
      metodoPago: this.metodoPago,
      totalRecibido: this.totalRecibido,
    })
    .subscribe({
      next: (venta: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Venta realizada',
          text: `Recibo #${venta.numeroRecibo}`,
        });

        // limpiar formulario
        this.totalRecibido = 0;
        this.metodoPago = 'EFECTIVO';
        this.pedidoSeleccionado = null;

        // recargar lista
        this.cargarPedidos();
      },
      error: (err) => {
        console.error(err);
        Swal.fire(
          'Error',
          err.error?.message || 'No se pudo facturar',
          'error'
        );
      },
    });
}
}
