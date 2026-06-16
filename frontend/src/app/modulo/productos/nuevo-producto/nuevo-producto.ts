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
      codigoProveedor: [''],
      codigoProducto: [''],
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

  async guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa los campos obligatorios', 'warning');
      return;
    }

    try {
      let imagenUrl = '';

      // 1. subir imagen si existe
      if (this.selectedFile) {
        imagenUrl = await this.subirImagen();
      }

      // 2. construir payload final
      const data = {
        ...this.form.value,
        imagenUrl,
      };

      // 3. crear producto
      console.log('URL IMAGEN:', imagenUrl);
      this.productosService.createProducto(data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Producto creado',
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate(['/productos/consulta']);
          });

          this.form.reset();
          this.imagePreview = null;
          this.selectedFile = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo crear el producto', 'error');
        },
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al subir la imagen', 'error');
    }
  }

  async subirImagen(): Promise<string> {
    const formData = new FormData();
    formData.append('file', this.selectedFile as File);

    return new Promise((resolve, reject) => {
      this.productosService.uploadImage(formData).subscribe({
        next: (res: any) => resolve(res.url),
        error: (err) => reject(err),
      });
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.cdr.detectChanges();
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
