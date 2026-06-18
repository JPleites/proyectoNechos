import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CategoriasService } from '../../services/categorias.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-subcategorias',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './crear-subcategorias.html',
  styleUrl: './crear-subcategorias.scss',
})
export class CrearSubcategorias {
  form: FormGroup;
  categorias: any[] = [];
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private categoriasService: CategoriasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      categoriaId: ['', Validators.required],
      nombre: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.categoriasService.getCategorias().subscribe((data: any) => {
      this.categorias = data;
      this.cdr.detectChanges();
    });
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa todos los campos', 'warning');
      return;
    }

    this.guardando = true;
    const { categoriaId, nombre } = this.form.value;

    this.categoriasService.createSubCategoria(Number(categoriaId), { nombre }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Subcategoría creada',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => this.router.navigate(['/categorias/consulta']));
      },
      error: (err) => {
        this.guardando = false;
        Swal.fire('Error', err.error?.message || 'No se pudo crear', 'error');
      },
    });
  }
}
