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

    // 👈 Abrir ventana ANTES del HTTP (acción directa del usuario)
    const ventanaRecibo = window.open('', '_blank', 'width=400,height=700');

    this.pedidosService
      .facturarPedido(this.pedidoSeleccionado.id, { metodoPago, totalRecibido: this.totalRecibido })
      .subscribe({
        next: (venta: any) => {
          this.ventaActual = venta;
          this.vendedorActual = venta.vendedor || 'N/A';

          // Mostrar modal
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

          // 👈 Esperar que Angular renderice el recibo y luego escribirlo
          setTimeout(() => {
            const contenido = document.getElementById('recibo-imprimir')?.innerHTML;
            if (!contenido || !ventanaRecibo) return;

            ventanaRecibo.document.write(this.generarHtmlRecibo(contenido));
            ventanaRecibo.document.close();
          }, 500);
        },
        error: (err) => {
          ventanaRecibo?.close();
          Swal.fire('Error', err.error?.message || 'No se pudo facturar', 'error');
        },
      });
  }

  imprimir() {
    const contenido = document.getElementById('recibo-imprimir')?.innerHTML;
    if (!contenido) return;

    const ventana = window.open('', '_blank', 'width=400,height=700');
    if (!ventana) return;

    ventana.document.write(this.generarHtmlRecibo(contenido));
    ventana.document.close();
  }

  private generarHtmlRecibo(contenido: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo</title>
          
          <style>
  @page {
    size: 80mm auto;
    margin: 2mm 3mm;
  }
  * {
    box-sizing: border-box;
  }
  body {
    width: 74mm;
    margin: 0 auto;
    padding: 0;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    line-height: 1.3;
  }
  table { width: 100%; border-collapse: collapse; }
  hr { border-top: 1px dashed #000; border-bottom: none; margin: 2px 0; }
  .text-center { text-align: center; }
  .text-end { text-align: right; }
  .fw-bold { font-weight: bold; }
  .d-flex { display: flex; }
  .justify-content-between { justify-content: space-between; }
  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: 2px; }
  .mb-2 { margin-bottom: 4px; }
  .mt-1 { margin-top: 2px; }
  .my-1 { margin-top: 2px; margin-bottom: 2px; }
  h5 { font-size: 12px; margin: 0 0 2px 0; }
  small { font-size: 9px; }
</style>
        </head>
        <body onload="window.print();">
          ${contenido}
        </body>
      </html>
    `;
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
