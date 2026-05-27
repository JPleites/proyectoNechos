import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { ProductosService } from '../../services/productos.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

export interface Almacen {
  id: number;
  almacenID: string;
  almacen: string;
}

@Component({
  selector: 'app-ingreso-producto',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ingreso-producto.html',
  styleUrl: './ingreso-producto.scss',
})
export class IngresoProducto {
  form: FormGroup;
  productoValido: any = null;
  almacenes: Almacen[] = [];
  ubicaciones: any = [];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private almacenService: AlmacenesService,
    private ubicacionService: UbicacionesService,
    private productoService: ProductosService,
  ) {
    this.form = this.fb.group({
      productoCodigo: ['', Validators.required],
      ubicacion: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      almacen: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.almacenService.getAlmacenes().subscribe({
      next: (res) => (this.almacenes = res),
    });
  }

  buscarProducto() {
    const codigo = this.form.get('productoCodigo')?.value;

    if (!codigo) {
      Swal.fire('Error', 'Ingrese código de producto', 'warning');
      return;
    }

    this.productoService.buscarProductos(codigo).subscribe({
      next: (res) => {
        this.productoValido = true;
        Swal.fire('OK', 'Producto encontrado', 'success');
        console.log('Producto válido:', this.productoValido);
      },
      error: () => {
        this.productoValido = null;
        Swal.fire('Error', 'Producto no existe', 'error');
      },
    });
  }

  ingresar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Datos incompletos', 'warning');
      return;
    }

    this.inventarioService.ingresar(this.form.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Producto ingresado', 'success');
        this.form.reset();
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Error', err.error?.message || 'Error al ingresar', 'error');
      },
    });
  }

  cargarUbicaciones() {
    const almacenId = this.form.get('almacen')?.value;
    const codigo = this.form.get('productoCodigo')?.value;

    if (!almacenId || !this.productoValido) return;

    this.inventarioService.getUbicacionesDisponibles(Number(almacenId), codigo).subscribe({
      next: (res) => {
        this.ubicaciones = res;
      },
    });
  }
}
