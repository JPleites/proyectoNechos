import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { InventarioService } from '../../services/inventario.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { ProductosService } from '../../services/productos.service';
import { UbicacionTransferencia } from '../../services/inventario.service';

export interface Almacen {
  id: number;
  almacenID: string;
  almacen: string;
}

@Component({
  selector: 'app-salida-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salida-producto.html',
  styleUrl: './salida-producto.scss',
})
export class SalidaProducto implements OnInit {
  form: FormGroup;

  productoValido: any = null;

  almacenes: Almacen[] = [];

  ubicaciones: UbicacionTransferencia[] = [];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private almacenService: AlmacenesService,
    private productoService: ProductosService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      productoCodigo: ['', Validators.required],
      almacen: ['', Validators.required],
      ubicacion: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.cargarAlmacenes();
  }

  // =========================================================
  // ALMACENES
  // =========================================================

  cargarAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (res) => {
        this.almacenes = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar almacenes:', err);

        Swal.fire('Error', 'No se pudieron cargar los almacenes', 'error');
      },
    });
  }

  // =========================================================
  // BUSCAR PRODUCTO
  // =========================================================

  buscarProducto(): void {
    const codigo = this.form.get('productoCodigo')?.value?.trim();

    if (!codigo) {
      Swal.fire('Producto requerido', 'Ingrese el código del producto', 'warning');
      return;
    }

    // Limpiar información anterior
    this.productoValido = null;
    this.ubicaciones = [];

    this.form.patchValue({
      almacen: '',
      ubicacion: '',
      cantidad: 0,
    });

    this.productoService.buscarProductos(codigo).subscribe({
      next: (res) => {
        this.productoValido = res;

        Swal.fire({
          icon: 'success',
          title: 'Producto encontrado',
          text: 'Ahora seleccione el almacén y la ubicación.',
          timer: 1500,
          showConfirmButton: false,
        });

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al buscar producto:', err);

        this.productoValido = null;
        this.ubicaciones = [];

        Swal.fire('Producto no encontrado', err.error?.message || 'El producto no existe', 'error');
      },
    });
  }

  // =========================================================
  // CARGAR UBICACIONES
  // =========================================================

  cargarUbicaciones(): void {
    const almacenId = Number(this.form.get('almacen')?.value);

    const codigo = this.form.get('productoCodigo')?.value?.trim();

    // Limpiar selección anterior
    this.form.patchValue({
      ubicacion: '',
      cantidad: 0,
    });

    this.ubicaciones = [];

    if (!almacenId || !codigo || !this.productoValido) {
      return;
    }

    this.inventarioService.getUbicacionesTransferencia(almacenId, codigo).subscribe({
      next: (res) => {
        // Para una salida manual solo mostramos
        // ubicaciones que realmente tienen stock disponible.
        this.ubicaciones = res.filter((ubicacion) => ubicacion.cantidadDisponible > 0);

        if (this.ubicaciones.length === 0) {
          Swal.fire(
            'Sin stock disponible',
            'El producto no tiene unidades disponibles para retirar en este almacén.',
            'info',
          );
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar ubicaciones:', err);

        Swal.fire('Error', err.error?.message || 'No se pudieron cargar las ubicaciones', 'error');
      },
    });
  }

  // =========================================================
  // UBICACION SELECCIONADA
  // =========================================================

  get ubicacionSeleccionada(): UbicacionTransferencia | undefined {
    const ubicacion = this.form.get('ubicacion')?.value;

    return this.ubicaciones.find((u) => u.ubicacion === ubicacion);
  }

  // =========================================================
  // STOCK DISPONIBLE
  // =========================================================

  get cantidadDisponible(): number {
    return this.ubicacionSeleccionada?.cantidadDisponible ?? 0;
  }

  // =========================================================
  // SELECCIONAR UBICACION
  // =========================================================

  seleccionarUbicacion(): void {
    const disponible = this.cantidadDisponible;

    // Reiniciamos la cantidad cada vez que cambia
    // la ubicación.
    this.form.patchValue({
      cantidad: disponible > 0 ? 1 : 0,
    });

    this.cdr.detectChanges();
  }

  // =========================================================
  // REGISTRAR SALIDA
  // =========================================================

  salir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Swal.fire('Datos incompletos', 'Complete todos los campos requeridos.', 'warning');

      return;
    }

    const productoCodigo = this.form.get('productoCodigo')?.value?.trim();

    const ubicacion = this.form.get('ubicacion')?.value;

    const cantidad = Number(this.form.get('cantidad')?.value);

    const disponible = this.cantidadDisponible;

    // Validaciones adicionales del lado del frontend
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      Swal.fire(
        'Cantidad inválida',
        'La cantidad debe ser un número entero mayor que 0.',
        'warning',
      );

      return;
    }

    if (!ubicacion) {
      Swal.fire(
        'Ubicación requerida',
        'Seleccione la ubicación desde donde se realizará la salida.',
        'warning',
      );

      return;
    }

    if (cantidad > disponible) {
      Swal.fire(
        'Stock insuficiente',
        `Solo hay ${disponible} unidades disponibles para retirar en esta ubicación.`,
        'warning',
      );

      return;
    }

    const ubicacionInfo = this.ubicacionSeleccionada;

    Swal.fire({
      title: '¿Confirmar salida?',
      html: `
        <div class="text-start">
          <p class="mb-2">
            <strong>Producto:</strong>
            ${productoCodigo}
          </p>

          <p class="mb-2">
            <strong>Ubicación:</strong>
            ${ubicacion}
          </p>

          <p class="mb-2">
            <strong>Cantidad a retirar:</strong>
            ${cantidad}
          </p>

          <p class="mb-0">
            <strong>Disponible actual:</strong>
            ${ubicacionInfo?.cantidadDisponible ?? 0}
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar salida',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.procesarSalida(productoCodigo, ubicacion, cantidad);
    });
  }

  // =========================================================
  // PROCESAR SALIDA
  // =========================================================

  private procesarSalida(productoCodigo: string, ubicacion: string, cantidad: number): void {
    this.inventarioService
      .salida({
        productoCodigo,
        ubicacion,
        cantidad,
      })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Salida registrada',
            text: 'La salida de inventario se registró correctamente.',
            timer: 1800,
            showConfirmButton: false,
          });

          this.limpiarFormulario();
        },

        error: (err: any) => {
          console.error('Error al registrar salida:', err);

          Swal.fire(
            'Error',
            err.error?.message || 'Error al registrar la salida de inventario',
            'error',
          );
        },
      });
  }

  // =========================================================
  // LIMPIAR
  // =========================================================

  private limpiarFormulario(): void {
    this.form.reset({
      productoCodigo: '',
      almacen: '',
      ubicacion: '',
      cantidad: 0,
    });

    this.productoValido = null;
    this.ubicaciones = [];

    this.cdr.detectChanges();
  }
}
