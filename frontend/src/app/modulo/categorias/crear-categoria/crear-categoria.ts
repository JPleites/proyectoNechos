import { Component } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-categoria',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-categoria.html',
  styleUrl: './crear-categoria.scss',
})
export class CrearCategoria {
  categoria = {
    nombre: '',
  };

  constructor(private categoriasService: CategoriasService) {}

  guardar() {
    if (!this.categoria.nombre) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.categoriasService.crearCategoria(this.categoria).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Categoría creada',
          timer: 1500,
          showConfirmButton: false,
        });
        this.categoria = { nombre: '' };
      },

      error: () => {
        Swal.fire('Error', 'Ocurrió un error al crear la categoría', 'error');
      },
    });
  }
}
