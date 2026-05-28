import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private pedidosService: PedidosService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.pedidosService.getPedidosEnCaja().subscribe({
      next: (data: any) => {
        this.pedidos = data;
        this.cdr.detectChanges();
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

  facturar(metodoPago: string) {
    if (!this.pedidoSeleccionado) return;

    if (this.totalRecibido < Number(this.pedidoSeleccionado.total)) {
      Swal.fire('Error', 'El monto recibido es insuficiente', 'warning');
      return;
    }

    this.pedidosService
      .facturarPedido(this.pedidoSeleccionado.id, {
        metodoPago,
        totalRecibido: this.totalRecibido,
      })
      .subscribe({
        next: (venta: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Venta realizada',
            text: `Recibo #${venta.ventaID}`,
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
          Swal.fire('Error', err.error?.message || 'No se pudo facturar', 'error');
        },
      });
  }
  eliminarDetalle(detalleId: number) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará del pedido',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.pedidosService.eliminarDetalle(detalleId).subscribe({
        next: () => {
          // actualizar localmente
          this.pedidoSeleccionado.detalles = this.pedidoSeleccionado.detalles.filter(
            (d: any) => d.id !== detalleId,
          );
          this.recalcularTotal();
          this.cdr.detectChanges();
        },
        error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error'),
      });
    });
  }

  actualizarCantidad(detalle: any, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      this.eliminarDetalle(detalle.id);
      return;
    }

    this.pedidosService.actualizarDetalle(detalle.id, nuevaCantidad).subscribe({
      next: () => {
        detalle.cantidad = nuevaCantidad;
        detalle.subtotal = nuevaCantidad * Number(detalle.precioUnitario);
        this.recalcularTotal();
        this.cdr.detectChanges();
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo actualizar', 'error'),
    });
  }

  private recalcularTotal() {
    if (!this.pedidoSeleccionado) return;
    this.pedidoSeleccionado.total = this.pedidoSeleccionado.detalles.reduce(
      (acc: number, d: any) => acc + Number(d.subtotal),
      0,
    );
  }
}
