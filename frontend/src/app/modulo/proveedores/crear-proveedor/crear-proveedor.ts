import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProveedoresService } from '../../services/proveedores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-proveedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-proveedor.html',
  styleUrl: './crear-proveedor.scss',
})
export class CrearProveedor {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ProveedoresService
  ) {
    this.form = this.fb.group({
      rtn: ['', Validators.required],
      proveedor: ['', Validators.required],
    });
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.service.crearProveedor(this.form.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          timer: 1500,
          showConfirmButton: false,
        });

        this.form.reset();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear', 'error');
      },
    });
  }
}