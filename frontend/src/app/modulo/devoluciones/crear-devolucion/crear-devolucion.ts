import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  DevolucionesService,
  VentaDevolucion,
  DetalleVentaDevolucion,
} from '../../../modulo/services/devoluciones';
import { ReciboDevolucionComponent } from '../recibo-devolucion/recibo-devolucion';
import { ImpresionReciboService } from '../../services/impresion-recibo';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-crear-devolucion',
  imports: [CommonModule, ReactiveFormsModule, ReciboDevolucionComponent],
  templateUrl: './crear-devolucion.html',
  styleUrl: './crear-devolucion.scss',
})
export class CrearDevolucion {
  formulario: FormGroup;

  venta: VentaDevolucion | null = null;

  devolucionActual: any = null;

  productoSeleccionado: DetalleVentaDevolucion | null = null;

  cargandoVenta = false;
  guardando = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly devolucionesService: DevolucionesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly impresionReciboService: ImpresionReciboService,
  ) {
    this.formulario = this.fb.group({
      ventaId: [null, [Validators.required, Validators.min(1)]],

      productoCodigo: ['', Validators.required],

      cantidad: [1, [Validators.required, Validators.min(1)]],

      motivo: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  // =====================================================
  // BUSCAR VENTA
  // =====================================================

  buscarVenta(): void {
    const controlVenta = this.formulario.get('ventaId');

    if (controlVenta?.invalid) {
      controlVenta?.markAsTouched();
      return;
    }

    const ventaId = Number(controlVenta?.value);

    this.cargandoVenta = true;

    this.venta = null;
    this.productoSeleccionado = null;

    this.formulario.patchValue({
      productoCodigo: '',
      cantidad: 1,
    });

    this.devolucionesService.obtenerVentaParaDevolucion(ventaId).subscribe({
      next: (venta) => {
        this.cargandoVenta = false;

        this.venta = venta;

        const disponibles = venta.detalles.filter((detalle) => detalle.cantidadDisponible > 0);

        if (!disponibles.length) {
          Swal.fire({
            icon: 'info',
            title: 'Sin productos disponibles',
            text: 'Esta venta ya no tiene productos disponibles para devolución.',
            confirmButtonText: 'Aceptar',
          });
        }
        this.cdr.detectChanges();
      },

      error: (error) => {
        this.cargandoVenta = false;

        Swal.fire({
          icon: 'error',
          title: 'Venta no disponible',
          text: error?.error?.message || 'No se pudo consultar la venta.',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  // =====================================================
  // SELECCIONAR PRODUCTO
  // =====================================================

  seleccionarProducto(): void {
    if (!this.venta) {
      this.productoSeleccionado = null;
      return;
    }

    const codigo = this.formulario.get('productoCodigo')?.value;

    this.productoSeleccionado =
      this.venta.detalles.find((detalle) => detalle.productoCodigo === codigo) ?? null;

    this.formulario.patchValue({
      cantidad: 1,
    });
  }

  // =====================================================
  // REGISTRAR DEVOLUCIÓN
  // =====================================================

  guardar(): void {
    if (!this.venta) {
      Swal.fire({
        icon: 'warning',
        title: 'Venta requerida',
        text: 'Primero debes consultar una venta.',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    if (!this.productoSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto requerido',
        text: 'Selecciona el producto que será devuelto.',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const cantidad = Number(this.formulario.get('cantidad')?.value);

    if (cantidad > this.productoSeleccionado.cantidadDisponible) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad no disponible',
        text:
          `Solo existen ` +
          `${this.productoSeleccionado.cantidadDisponible} ` +
          `unidad(es) disponibles para devolución.`,
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    const data = {
      ventaId: this.venta.id,

      productoCodigo: this.productoSeleccionado.productoCodigo,

      cantidad,

      motivo: this.formulario.get('motivo')?.value.trim(),
    };

    this.guardando = true;

    this.devolucionesService.crearDevolucion(data).subscribe({
      next: (devolucion) => {
        this.guardando = false;

        this.devolucionActual = devolucion;

        this.limpiar();

        this.cdr.detectChanges();

        const modalEl = document.getElementById('modalReciboDevolucion');

        if (modalEl) {
          const modal = new Modal(modalEl);
          modal.show();
        }
      },

      error: (error) => {
        this.guardando = false;

        Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar',
          text: error?.error?.message || 'Ocurrió un error al registrar la devolución.',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  imprimirDevolucion(): void {
  this.impresionReciboService.imprimirElemento(
    'devolucion-imprimir',
    'Comprobante de devolución',
  );
}

  // =====================================================
  // LIMPIAR
  // =====================================================

  limpiar(): void {
    this.formulario.reset({
      ventaId: null,
      productoCodigo: '',
      cantidad: 1,
      motivo: '',
    });

    this.venta = null;
    this.productoSeleccionado = null;
  }

  // =====================================================
  // VALOR DE DEVOLUCIÓN
  // =====================================================

  get valorDevolucion(): number {
    if (!this.productoSeleccionado) {
      return 0;
    }

    const cantidad = Number(this.formulario.get('cantidad')?.value || 0);

    return cantidad * Number(this.productoSeleccionado.precioUnitario);
  }
}
