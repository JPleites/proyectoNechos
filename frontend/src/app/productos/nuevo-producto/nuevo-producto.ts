import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-producto',
  imports: [ReactiveFormsModule],
  templateUrl: './nuevo-producto.html',
  styleUrl: './nuevo-producto.scss',
})
export class NuevoProducto {
  form: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      producto: ['', Validators.required],
      costo: [, Validators.required],
      precio: [, Validators.required],
      descuento: [],
      proveedor: ['', Validators.required],
      marca: [''],
      categoria: [''],
      descripcion: [''],
    });
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa los campos obligatorios', 'warning');
      return;
    }

    this.productosService.createProducto(this.form.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Producto creado',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/productos/consulta']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo crear el producto', 'error');
      },
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result;
    };

    reader.readAsDataURL(file);
  }
}
