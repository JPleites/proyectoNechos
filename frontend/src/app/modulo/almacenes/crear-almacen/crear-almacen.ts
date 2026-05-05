import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlmacenesService } from '../../services/almacenes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-almacen',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-almacen.html',
  styleUrl: './crear-almacen.scss',
})
export class CrearAlmacen {
  almacen = {
    id: '',
    almacen: '',
  };

  constructor(private service: AlmacenesService) {}

  guardar() {
    if (!this.almacen.id || !this.almacen.almacen) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    this.service.crearAlmacen(this.almacen).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Almacén creado', 'success');

        this.almacen = {
          id: '',
          almacen: '',
        };
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear', 'error');
      },
    });
  }
}
