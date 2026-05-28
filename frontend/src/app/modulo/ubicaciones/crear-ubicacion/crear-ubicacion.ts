import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    deposito: '',
  };

  almacenes: any[] = [];

  constructor(
    private ubicacionesService: UbicacionesService,
    private almacenesService: AlmacenesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarAlmacenes();
  }

  cargarAlmacenes() {
    this.almacenesService.getAlmacenes().subscribe((data: any) => {
      this.almacenes = data;
      this.cdr.detectChanges();
    });
  }

  guardar() {
    if (!this.ubicacion.estante || !this.ubicacion.nivel || !this.ubicacion.almacenId) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }
    const data = {
      ...this.ubicacion,
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
          deposito: '',
        };
      },

      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear', 'error');
      },
    });
  }
}
