import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ProductosService } from '../../services/productos.service';
import { ProveedoresService } from '../../services/proveedores.service';
import { CategoriasService } from '../../services/categorias.service';
import { MarcaService } from '../../services/marca.service';

@Component({
  selector: 'app-editar-producto',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.scss',
})
export class EditarProducto implements OnInit {
  form: FormGroup;

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  categorias: any[] = [];
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  marcasFiltradas: any[] = [];
  subCategorias: any[] = [];

  guardando = false;
  cargando = true;

  codigoProducto = '';
  imagenOriginal = '';

  productoOriginal: any = null;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService,
    private categoriasService: CategoriasService,
    private marcaService: MarcaService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      codigo: [{ value: '', disabled: true }],
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
      subCategoria: [''],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.codigoProducto = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.codigoProducto) {
      Swal.fire('Error', 'No se especificó el producto que desea editar', 'error').then(() => {
        this.router.navigate(['/productos/consulta']);
      });

      return;
    }

    this.cargarDatosIniciales();
  }

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  cargarDatosIniciales(): void {
    this.cargando = true;

    this.cargarCategorias();

    this.cargarProveedoresGenerales();

    this.productosService.getProducto(this.codigoProducto).subscribe({
      next: (producto: any) => {
        if (!producto) {
          Swal.fire('Error', 'Producto no encontrado', 'error').then(() => {
            this.router.navigate(['/productos/consulta']);
          });

          return;
        }

        this.productoOriginal = producto;

        this.imagenOriginal = producto.imagenUrl ?? '';

        this.imagePreview =
          producto.imagenUrl && producto.imagenUrl.trim() !== '' ? producto.imagenUrl : null;

        // Cargamos primero los campos simples.
        this.form.patchValue({
          codigo: producto.codigo,
          codigoProveedor: producto.codigoProveedor ?? '',
          codigoProducto: producto.codigoProducto ?? '',
          producto: producto.producto ?? '',
          costoCompra: Number(producto.costoCompra ?? 0),
          costoVenta: Number(producto.costoVenta ?? 0),
          precio: Number(producto.precio ?? 0),
          descuento: Number(producto.descuento ?? 0),
          descripcion: producto.descripcion ?? '',
          categoria: producto.categoriaId ?? '',
          proveedor: producto.proveedorId ?? '',
          marca: producto.marcaId ?? '',
          subCategoria: producto.subCategoriaId ?? '',
        });

        // Ahora cargamos las dependencias de los selects.
        this.cargarDatosRelacionados(producto);

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar producto:', err);

        this.cargando = false;

        Swal.fire('Error', 'No se pudo cargar la información del producto', 'error').then(() => {
          this.router.navigate(['/productos/consulta']);
        });
      },
    });
  }

  // ============================================================
  // CARGAR DATOS RELACIONADOS
  // ============================================================

  cargarDatosRelacionados(producto: any): void {
    const categoriaId = Number(producto.categoriaId);
    const proveedorId = Number(producto.proveedorId);

    // -------------------------
    // Proveedores por categoría
    // -------------------------

    const categoria = this.categorias.find((c) => Number(c.id) === categoriaId);

    if (categoria) {
      this.proveedoresFiltrados =
        categoria.CategoriaProveedores?.map((cp: any) => cp.proveedor) ?? [];
    }

    // -------------------------
    // Subcategorías
    // -------------------------

    if (categoriaId) {
      this.categoriasService.getSubCategorias(categoriaId).subscribe({
        next: (data: any) => {
          this.subCategorias = data ?? [];

          this.form.patchValue({
            subCategoria: producto.subCategoriaId ?? '',
          });

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Error al cargar subcategorías:', err);

          this.subCategorias = [];
        },
      });
    }

    // -------------------------
    // Marcas por proveedor
    // -------------------------

    if (proveedorId) {
      this.marcaService.getMarcasPorProveedor(proveedorId).subscribe({
        next: (data: any) => {
          this.marcasFiltradas = data ?? [];

          this.form.patchValue({
            marca: producto.marcaId ?? '',
          });

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Error al cargar marcas:', err);

          this.marcasFiltradas = [];
        },
      });
    }
  }

  // ============================================================
  // CATEGORÍAS
  // ============================================================

  cargarCategorias(): void {
    this.categoriasService.getCategorias().subscribe({
      next: (data: any) => {
        this.categorias = data ?? [];

        // Si el producto ya fue cargado antes que las categorías,
        // intentamos reconstruir los proveedores.
        if (this.productoOriginal) {
          this.cargarDatosRelacionados(this.productoOriginal);
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar categorías:', err);
      },
    });
  }

  // ============================================================
  // PROVEEDORES
  // ============================================================

  cargarProveedoresGenerales(): void {
    this.proveedoresService.getProveedores().subscribe({
      next: (data: any) => {
        this.proveedores = data ?? [];

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      },
    });
  }

  // ============================================================
  // CAMBIO DE CATEGORÍA
  // ============================================================

  onCategoriaChange(): void {
    const categoriaId = this.form.get('categoria')?.value;

    const categoria = this.categorias.find((c) => Number(c.id) === Number(categoriaId));

    if (!categoria) {
      this.proveedoresFiltrados = [];
      this.subCategorias = [];

      this.form.patchValue({
        proveedor: '',
        marca: '',
        subCategoria: '',
      });

      this.marcasFiltradas = [];

      return;
    }

    // Proveedores permitidos para la categoría
    this.proveedoresFiltrados =
      categoria.CategoriaProveedores?.map((cp: any) => cp.proveedor) ?? [];

    // Al cambiar categoría debemos reiniciar proveedor,
    // marca y subcategoría.
    this.form.patchValue({
      proveedor: '',
      marca: '',
      subCategoria: '',
    });

    this.marcasFiltradas = [];

    // Cargar subcategorías
    this.categoriasService.getSubCategorias(Number(categoriaId)).subscribe({
      next: (data: any) => {
        this.subCategorias = data ?? [];
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar subcategorías:', err);

        this.subCategorias = [];
      },
    });

    this.cdr.detectChanges();
  }

  // ============================================================
  // CAMBIO DE PROVEEDOR
  // ============================================================

  onProveedorChange(): void {
    const proveedorId = Number(this.form.get('proveedor')?.value);

    if (!proveedorId) {
      this.marcasFiltradas = [];

      this.form.patchValue({
        marca: '',
      });

      return;
    }

    this.marcaService.getMarcasPorProveedor(proveedorId).subscribe({
      next: (data: any) => {
        this.marcasFiltradas = data ?? [];

        this.form.patchValue({
          marca: '',
        });

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar marcas:', err);

        this.marcasFiltradas = [];
      },
    });
  }

  // ============================================================
  // IMAGEN
  // ============================================================

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result;

      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  async subirImagen(): Promise<string> {
    const formData = new FormData();

    formData.append('file', this.selectedFile as File);

    return new Promise((resolve, reject) => {
      this.productosService.uploadImage(formData).subscribe({
        next: (res: any) => {
          resolve(res.url);
        },

        error: (err) => {
          reject(err);
        },
      });
    });
  }

  // ============================================================
  // GUARDAR CAMBIOS
  // ============================================================

  async guardar(): Promise<void> {
    if (this.guardando) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Swal.fire('Error', 'Completa los campos obligatorios', 'warning');

      return;
    }

    this.guardando = true;

    try {
      // Conservamos la imagen existente.
      let imagenUrl = this.imagenOriginal;

      // Si seleccionó una nueva, reemplazamos la anterior.
      if (this.selectedFile) {
        imagenUrl = await this.subirImagen();
      }

      const valores = this.form.getRawValue();

      const data = {
        codigoProveedor: valores.codigoProveedor,
        codigoProducto: valores.codigoProducto,
        producto: valores.producto,

        costoCompra: Number(valores.costoCompra),
        costoVenta: Number(valores.costoVenta),
        precio: Number(valores.precio),
        descuento: Number(valores.descuento ?? 0),

        descripcion: valores.descripcion ?? '',

        proveedor: Number(valores.proveedor),
        marca: Number(valores.marca),
        categoria: Number(valores.categoria),

        subCategoria: valores.subCategoria ? Number(valores.subCategoria) : null,

        imagenUrl,
      };

      console.log('Actualizando producto:', data);

      this.productosService.updateProducto(this.codigoProducto, data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Producto actualizado',
            text: 'Los cambios se guardaron correctamente',
            timer: 1800,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate(['/productos/gestionar']);
          });

          this.guardando = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Error al actualizar producto:', err);

          this.guardando = false;

          const mensaje = err?.error?.message ?? 'No se pudo actualizar el producto';

          Swal.fire('Error', Array.isArray(mensaje) ? mensaje.join(', ') : mensaje, 'error');

          this.cdr.detectChanges();
        },
      });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);

      this.guardando = false;

      Swal.fire('Error', 'No se pudo procesar la imagen', 'error');

      this.cdr.detectChanges();
    }
  }

  // ============================================================
  // CANCELAR
  // ============================================================

  cancelar(): void {
    if (this.guardando) {
      return;
    }

    this.router.navigate(['/productos/gestionar']);
  }
}
