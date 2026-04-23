import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-salida-producto',
  imports: [ReactiveFormsModule],
  templateUrl: './salida-producto.html',
  styleUrl: './salida-producto.scss',
})
export class SalidaProducto {
  form: FormGroup;

  constructor(private fb: FormBuilder, private inventarioService: InventarioService) {
    this.form = this.fb.group({
      productoCodigo: ['', Validators.required],
      ubicacion: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
    });
  }

  salir() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Datos incompletos', 'warning');
      return;
    }

    this.inventarioService.salida(this.form.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Salida registrada', 'success');
        this.form.reset();
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Error', err.error?.message || 'Error al registrar salida', 'error');
      },
    });
  }
}
