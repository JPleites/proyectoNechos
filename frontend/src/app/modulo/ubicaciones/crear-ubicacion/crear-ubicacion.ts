import { Component, OnInit } from '@angular/core';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-ubicacion',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-ubicacion.html',
  styleUrl: './crear-ubicacion.scss',
})
export class CrearUbicacion implements OnInit {
  ubicacion = {
    ubicacion: '',
    estante: '',
    nivel: '',
    almacenId: '',
  };

  almacenes: any[] = [];

  constructor(
    private ubicacionesService: UbicacionesService,
    private almacenesService: AlmacenesService,
  ) {}

  ngOnInit() {
    this.cargarAlmacenes();
  }

  cargarAlmacenes() {
    this.almacenesService.getAlmacenes().subscribe((data: any) => {
      this.almacenes = data;
    });
  }

  guardar() {
    if (!this.ubicacion.estante || !this.ubicacion.nivel || !this.ubicacion.almacenId) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    const codigo =
      this.ubicacion.almacenId + 'E' + this.ubicacion.estante + 'N' + this.ubicacion.nivel;

    const data = {
      ...this.ubicacion,
      ubicacion: codigo,
    };

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.ubicacionesService.crearUbicacion(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Ubicación creada',
          timer: 1500,
          showConfirmButton: false,
        });

        this.ubicacion = {
          ubicacion: '',
          estante: '',
          nivel: '',
          almacenId: '',
        };
      },

      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear', 'error');
      },
    });
  }
}
