import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../services/pedidos.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReciboComponent } from '../recibo/recibo';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-consulta-pedidos',
  imports: [CommonModule, FormsModule, ReciboComponent],
  templateUrl: './consulta-pedidos.html',
  styleUrl: './consulta-pedidos.scss',
})
export class ConsultaPedidos implements OnInit {
  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  metodoPago = 'EFECTIVO';
  totalRecibido: number = 0;
  ventaActual: any = null;
  vendedorActual: string = '';

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
      .facturarPedido(this.pedidoSeleccionado.id, { metodoPago, totalRecibido: this.totalRecibido })
      .subscribe({
        next: (venta: any) => {
          this.ventaActual = venta;
          this.vendedorActual = venta.vendedor || 'N/A';

          // abrir modal
          const modalEl = document.getElementById('modalRecibo');
          if (modalEl) {
            const modal = new Modal(modalEl);
            modal.show();
          }

          // limpiar
          this.totalRecibido = 0;
          this.pedidoSeleccionado = null;
          this.cargarPedidos();
          this.cdr.detectChanges();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'No se pudo facturar', 'error');
        },
      });
  }

  imprimir() {
    const contenido = document.getElementById('recibo-imprimir')?.innerHTML;
    if (!contenido) return;

    window.print(); // Esto abrirá el diálogo de impresión del navegador

  //   const ventana = window.open('', '_blank', 'width=300,height=600');
  //   if (!ventana) return;

  //   ventana.document.write(`
  //   <!DOCTYPE html>
  //   <html>
  //     <head>
  //       <title>Recibo</title>
  //       <style>
  //         @page { size: 80mm auto; margin: 4mm; }
  //         body {
  //           width: 80mm;
  //           margin: 0;
  //           padding: 4px;
  //           font-family: 'Courier New', monospace;
  //           font-size: 11px;
  //         }
  //         table { width: 100%; border-collapse: collapse; }
  //         hr { border-top: 1px dashed #000; border-bottom: none; }
  //         .text-center { text-align: center; }
  //         .text-end { text-align: right; }
  //         .fw-bold { font-weight: bold; }
  //         .d-flex { display: flex; }
  //         .justify-content-between { justify-content: space-between; }
  //         .mb-0 { margin-bottom: 0; }
  //         .mb-1 { margin-bottom: 4px; }
  //         .mb-2 { margin-bottom: 8px; }
  //         .mt-1 { margin-top: 4px; }
  //         .my-1 { margin-top: 4px; margin-bottom: 4px; }
  //         h5 { font-size: 14px; margin: 0; }
  //       </style>
  //     </head>
  //     <body onload="window.print(); window.close();">
  //       ${contenido}
  //     </body>
  //   </html>
  // `);
  //   ventana.document.close();
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
