import { Component } from '@angular/core';
import { ProveedoresService } from '../../services/proveedores.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-proveedor',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-proveedor.html',
  styleUrl: './crear-proveedor.scss',
})
export class CrearProveedor {
  proveedor = {
    rtn: '',
    proveedor: '',
  };

  constructor(private service: ProveedoresService) {}

  guardar() {
    if (!this.proveedor.rtn || !this.proveedor.proveedor) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.service.crearProveedor(this.proveedor).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          timer: 1500,
          showConfirmButton: false,
        });

        this.proveedor = { rtn: '', proveedor: '' };
      },

      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear', 'error');
      },
    });
  }
}
