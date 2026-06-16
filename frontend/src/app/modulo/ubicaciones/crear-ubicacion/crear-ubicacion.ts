import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-ubicacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-ubicacion.html',
  styleUrl: './crear-ubicacion.scss',
})
export class CrearUbicacion implements OnInit {

  form!: FormGroup;
  almacenes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ubicacionesService: UbicacionesService,
    private almacenesService: AlmacenesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarAlmacenes();
  }

  // 🔥 FORM REACTIVE
  initForm() {
    this.form = this.fb.group({
      almacenId: ['', Validators.required],
      estante: ['', [Validators.required, Validators.min(0)]],
      nivel: ['', [Validators.required, Validators.min(0)]],
      deposito: ['', [Validators.required, Validators.min(0)]],
    });
  }

  cargarAlmacenes() {
    this.almacenesService.getAlmacenes().subscribe((data: any) => {
      this.almacenes = data;
      this.cdr.detectChanges();
    });
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    const data = this.form.value;

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

        this.form.reset();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear', 'error');
      },
    });
  }

  get f() {
    return this.form.controls;
  }
}