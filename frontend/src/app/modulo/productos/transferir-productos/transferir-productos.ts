import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { ProductosService } from '../../services/productos.service';
import Swal from 'sweetalert2';

export interface Almacen {
  id: number;
  almacenID: string;
  almacen: string;
}

export interface UbicacionTransferencia {
  ubicacion: string;
  deposito: number;
  estante: number;
  nivel: number;
  almacenId: number;
  cantidad: number;
  cantidadReservada: number;
  cantidadDisponible: number;
}

export interface UbicacionDestino {
  ubicacion: string;
  deposito: number;
  estante: number;
  nivel: number;
  almacenId: number;
}

@Component({
  selector: 'app-transferir-productos',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transferir-productos.html',
  styleUrl: './transferir-productos.scss',
})
export class TransferirProductos implements OnInit {
  form: FormGroup;

  productoValido: any = null;

  almacenes: Almacen[] = [];

  ubicacionesOrigen: UbicacionTransferencia[] = [];
  ubicacionesDestino: UbicacionDestino[] = [];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private almacenService: AlmacenesService,
    private productoService: ProductosService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      productoCodigo: ['', Validators.required],

      almacenOrigen: ['', Validators.required],
      ubicacionOrigen: ['', Validators.required],

      cantidad: [0, [Validators.required, Validators.min(1)]],

      almacenDestino: ['', Validators.required],
      ubicacionDestino: ['', Validators.required],

      referencia: [''],
    });
  }

  ngOnInit() {
    this.almacenService.getAlmacenes().subscribe({
      next: (res) => {
        this.almacenes = res;
      },
      error: (err) => {
        console.error(err);

        Swal.fire('Error', 'No se pudieron cargar los almacenes', 'error');
      },
    });
  }

  buscarProducto() {
    const codigo = this.form.get('productoCodigo')?.value?.trim();

    if (!codigo) {
      Swal.fire('Código requerido', 'Ingrese el código del producto', 'warning');
      return;
    }

    this.productoService.buscarProductos(codigo).subscribe({
      next: () => {
        this.productoValido = true;

        // Limpiamos ubicaciones anteriores por si se buscó otro producto.
        this.ubicacionesOrigen = [];
        this.ubicacionesDestino = [];

        this.form.patchValue({
          ubicacionOrigen: '',
          ubicacionDestino: '',
          cantidad: 0,
        });

        Swal.fire({
          icon: 'success',
          title: 'Producto encontrado',
          text: 'Ahora seleccione el almacén y ubicación de origen.',
          timer: 1800,
          showConfirmButton: false,
        });

        this.cdr.detectChanges();
      },

      error: () => {
        this.productoValido = null;

        this.ubicacionesOrigen = [];
        this.ubicacionesDestino = [];

        this.form.patchValue({
          ubicacionOrigen: '',
          ubicacionDestino: '',
          cantidad: 0,
        });

        Swal.fire(
          'Producto no encontrado',
          'El código ingresado no corresponde a un producto existente',
          'error',
        );
      },
    });
  }

  get ubicacionOrigenSeleccionada(): UbicacionTransferencia | undefined {
    const ubicacion = this.form.get('ubicacionOrigen')?.value;

    return this.ubicacionesOrigen.find((u) => u.ubicacion === ubicacion);
  }

  cargarUbicacionesOrigen() {
    const almacenId = this.form.get('almacenOrigen')?.value;
    const codigo = this.form.get('productoCodigo')?.value;

    this.form.patchValue({
      ubicacionOrigen: '',
      cantidad: 0,
    });

    this.ubicacionesOrigen = [];

    if (!almacenId || !codigo || !this.productoValido) {
      return;
    }

    this.inventarioService.getUbicacionesTransferencia(Number(almacenId), codigo).subscribe({
      next: (res: UbicacionTransferencia[]) => {
        this.ubicacionesOrigen = res.filter((ubicacion) => ubicacion.cantidadDisponible > 0);

        if (this.ubicacionesOrigen.length === 0) {
          Swal.fire(
            'Sin stock disponible',
            'El producto no tiene stock disponible para transferir en este almacén.',
            'info',
          );
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);

        Swal.fire(
          'Error',
          err.error?.message || 'No se pudieron cargar las ubicaciones de origen',
          'error',
        );
      },
    });
  }

  cargarUbicacionesDestino() {
    const almacenId = this.form.get('almacenDestino')?.value;
    const codigo = this.form.get('productoCodigo')?.value;

    this.form.patchValue({
      ubicacionDestino: '',
    });

    this.ubicacionesDestino = [];

    if (!almacenId || !codigo || !this.productoValido) {
      return;
    }

    this.inventarioService.getUbicacionesDisponibles(Number(almacenId), codigo).subscribe({
      next: (res: UbicacionDestino[]) => {
        this.ubicacionesDestino = res;

        if (this.ubicacionesDestino.length === 0) {
          Swal.fire(
            'Sin ubicaciones',
            'No existen ubicaciones disponibles en el almacén seleccionado.',
            'info',
          );
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);

        Swal.fire(
          'Error',
          err.error?.message || 'No se pudieron cargar las ubicaciones de destino',
          'error',
        );
      },
    });
  }

  seleccionarOrigen() {
    const ubicacionCodigo = this.form.get('ubicacionOrigen')?.value;

    const ubicacion = this.ubicacionesOrigen.find((u) => u.ubicacion === ubicacionCodigo);

    if (!ubicacion) {
      return;
    }

    // Si había una cantidad superior a la disponible, la corregimos.
    const cantidadActual = Number(this.form.get('cantidad')?.value || 0);

    if (cantidadActual > ubicacion.cantidadDisponible) {
      this.form.patchValue({
        cantidad: ubicacion.cantidadDisponible,
      });
    }
  }

  get cantidadDisponibleOrigen(): number {
    const ubicacionCodigo = this.form.get('ubicacionOrigen')?.value;

    const ubicacion = this.ubicacionesOrigen.find((u) => u.ubicacion === ubicacionCodigo);

    return ubicacion?.cantidadDisponible ?? 0;
  }

  transferir() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Swal.fire('Datos incompletos', 'Complete todos los campos obligatorios', 'warning');

      return;
    }

    const cantidad = Number(this.form.get('cantidad')?.value);
    const disponible = this.cantidadDisponibleOrigen;

    if (cantidad <= 0 || !Number.isInteger(cantidad)) {
      Swal.fire(
        'Cantidad inválida',
        'La cantidad debe ser un número entero mayor que 0.',
        'warning',
      );

      return;
    }

    if (cantidad > disponible) {
      Swal.fire(
        'Stock insuficiente',
        `Solo hay ${disponible} unidades disponibles para transferir en la ubicación de origen.`,
        'warning',
      );

      return;
    }

    const ubicacionOrigen = this.form.get('ubicacionOrigen')?.value;
    const ubicacionDestino = this.form.get('ubicacionDestino')?.value;

    if (ubicacionOrigen === ubicacionDestino) {
      Swal.fire(
        'Ubicaciones inválidas',
        'La ubicación origen y destino deben ser diferentes.',
        'warning',
      );

      return;
    }

    const data = {
      productoCodigo: this.form.get('productoCodigo')?.value,
      ubicacionOrigen,
      ubicacionDestino,
      cantidad,
      referencia: this.form.get('referencia')?.value || undefined,
    };

    Swal.fire({
      title: '¿Confirmar transferencia?',
      html: `
        <div class="text-start">
          <p class="mb-2"><strong>Producto:</strong> ${data.productoCodigo}</p>
          <p class="mb-2"><strong>Origen:</strong> ${ubicacionOrigen}</p>
          <p class="mb-2"><strong>Destino:</strong> ${ubicacionDestino}</p>
          <p class="mb-0"><strong>Cantidad:</strong> ${cantidad}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, transferir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.inventarioService.transferirProducto(data).subscribe({
        next: () => {
          Swal.fire(
            'Transferencia realizada',
            'El inventario fue transferido correctamente.',
            'success',
          );

          this.form.reset({
            productoCodigo: '',
            almacenOrigen: '',
            ubicacionOrigen: '',
            cantidad: 0,
            almacenDestino: '',
            ubicacionDestino: '',
            referencia: '',
          });

          this.productoValido = null;
          this.ubicacionesOrigen = [];
          this.ubicacionesDestino = [];
        },

        error: (err) => {
          console.error(err);

          Swal.fire(
            'Error',
            err.error?.message || 'No se pudo realizar la transferencia.',
            'error',
          );
        },
      });
    });
  }
}
