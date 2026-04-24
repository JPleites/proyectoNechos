import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ingreso-producto',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ingreso-producto.html',
  styleUrl: './ingreso-producto.scss',
})
export class IngresoProducto {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
  ) {
    this.form = this.fb.group({
      productoCodigo: ['', Validators.required],
      ubicacion: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
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
}
