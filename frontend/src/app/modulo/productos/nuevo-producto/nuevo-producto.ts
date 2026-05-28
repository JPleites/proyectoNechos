import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProveedoresService } from '../../services/proveedores.service';
import { CategoriasService } from '../../services/categorias.service';
import { MarcaService } from '../../services/marca.service';

@Component({
  selector: 'app-nuevo-producto',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './nuevo-producto.html',
  styleUrl: './nuevo-producto.scss',
})
export class NuevoProducto implements OnInit {
  form: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  categorias: any[] = [];
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  marcasFiltradas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private categoriasService: CategoriasService,
    private proveedoresService: ProveedoresService,
    private marcaService: MarcaService,
  ) {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      producto: ['', Validators.required],
      costoCompra: [0, Validators.required],
      costoVenta: [0, Validators.required],
      precio: [0, Validators.required],
      descuento: [0],
      proveedor: ['', Validators.required],
      marca: ['', Validators.required],
      categoria: ['', Validators.required],
      descripcion: [''],
    });
  }

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProveedores();
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

  cargarCategorias() {
    this.categoriasService.getCategorias().subscribe((data: any) => {
      this.categorias = data;
      this.cdr.detectChanges();
    });
  }

  cargarProveedores() {
    this.proveedoresService.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
      this.cdr.detectChanges();
    });
  }

  onCategoriaChange() {
    const categoriaId = this.form.get('categoria')?.value;

    const categoria = this.categorias.find((c) => Number(c.id) === Number(categoriaId));

    if (!categoria) return;

    this.proveedoresFiltrados = categoria.CategoriaProveedores.map((cp: any) => cp.proveedor);

    // limpiar proveedor seleccionado
    this.form.patchValue({ proveedor: '' });
    this.cdr.detectChanges();
  }

  onProveedorChange() {
    const proveedorId = Number(this.form.get('proveedor')?.value);

    if (!proveedorId) return;

    // 🔥 pedir al backend las marcas reales
    this.marcaService.getMarcasPorProveedor(proveedorId).subscribe((data: any) => {
      this.marcasFiltradas = data ?? [];
      this.form.patchValue({ marca: '' });
      this.cdr.detectChanges();
    });
  }
}
