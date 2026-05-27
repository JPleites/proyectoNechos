import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { MarcaService } from '../../services/marca.service';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-crear-marca',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-marca.html',
  styleUrl: './crear-marca.scss',
})
export class CrearMarca implements OnInit {

  form: FormGroup;
  proveedores: any[] = [];
  marcas: any[] = [];
  marcasFiltradas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private marcaService: MarcaService,
    private proveedorService: ProveedoresService,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      proveedorId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarProveedores();
    this.cargarMarcas();
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe((res: any) => {
      this.proveedores = res;
    });
  }

  cargarMarcas() {
    this.marcaService.getMarcas().subscribe((res: any) => {
      this.marcas = res;
    });
  }

  onProveedorChange() {
    const id = this.form.get('proveedorId')?.value;

    this.marcaService.getPorProveedor(id).subscribe((res: any) => {
      this.marcasFiltradas = res;
    });
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa los campos', 'warning');
      return;
    }

    this.marcaService.createMarca(this.form.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Marca creada', 'success');
        this.form.reset();
        this.cargarMarcas();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al crear marca', 'error');
      },
    });
  }
}