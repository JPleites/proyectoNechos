import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { InventarioService } from '../../services/inventario.service';
import { CategoriasService } from '../../services/categorias.service';
import { ProveedoresService } from '../../services/proveedores.service';
import { MarcaService } from '../../services/marca.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Producto {
  codigo: string;
  producto: string;
  precio: number;
  imagenUrl?: string;
  marcaRel?: any;
  categoriaRel?: any;
  proveedorRel?: any;
  subCategoria?: any;
  descripcion?: string;
  costoCompra?: number;
  costoVenta?: number;
  productoID?: number;
  codigoProveedor?: string;
  codigoProducto?: string;
  existencia?: number;
}

interface Inventario {
  ubicacion: string;
  cantidad: number;
  cantidadReservada: number;
}

@Component({
  selector: 'app-gestion-productos',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.scss',
})
export class GestionProductos implements OnInit {
  productos: Producto[] = [];
  todosLosProductos: Producto[] = [];

  inventarios: Record<string, Inventario[]> = {};
  stockMap: Record<string, number> = {};

  inventarioVisible: string | null = null;

  filtros = {
    q: '',
    categoriaId: '',
    proveedorId: '',
    marcaId: '',
    subCategoriaId: '',
  };

  categorias: any[] = [];
  proveedores: any[] = [];
  marcas: any[] = [];
  subCategorias: any[] = [];

  selectedProduct: Producto | null = null;
  mostrarSinExistencia = false;
  inventarioModal: Inventario[] = [];

  constructor(
    private productosService: ProductosService,
    private inventarioService: InventarioService,
    private categoriasService: CategoriasService,
    private proveedoresService: ProveedoresService,
    private marcaService: MarcaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarFiltros();
  }

  // =========================
  // PRODUCTOS
  // =========================
  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.todosLosProductos = data ?? [];
        this.productos = [...this.todosLosProductos];

        this.stockMap = {};
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  // =========================
  // MODAL DETALLE
  // =========================
  verDetalle(producto: Producto) {
    this.selectedProduct = producto;
    this.inventarioModal = [];

    this.inventarioService.getInventarioPorProducto(producto.codigo).subscribe({
      next: (res: any) => {
        this.inventarioModal = Array.isArray(res) ? res : (res?.inventario ?? []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  cerrarModal() {
    this.selectedProduct = null;
    this.inventarioModal = [];
  }

  // =========================
  // FILTROS
  // =========================
  cargarFiltros() {
    this.categoriasService.getCategorias().subscribe((data: any) => {
      this.categorias = data;
      this.cdr.detectChanges();
    });

    this.proveedoresService.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
      this.cdr.detectChanges();
    });

    this.marcaService.getMarcas().subscribe((data: any) => {
      this.marcas = data;
      this.cdr.detectChanges();
    });
  }

  onCategoriaChange(categoriaId: string) {
    this.filtros.subCategoriaId = '';
    if (!categoriaId) {
      this.subCategorias = [];
      return;
    }

    this.categoriasService.getSubCategorias(Number(categoriaId)).subscribe({
      next: (data: any) => {
        this.subCategorias = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  aplicarFiltros() {
    this.productos = [];
    this.inventarioVisible = null;
    this.stockMap = {};

    this.productosService.filtrosProductos(this.filtros).subscribe({
      next: (data: any) => {
        this.productos = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  limpiarFiltros() {
    this.filtros = {
      q: '',
      categoriaId: '',
      proveedorId: '',
      marcaId: '',
      subCategoriaId: '',
    };
    this.subCategorias = [];
  }

  filtrarSinExistencia() {
  this.mostrarSinExistencia = !this.mostrarSinExistencia;

  if (this.mostrarSinExistencia) {
    this.todosLosProductos = [...this.productos];
    this.productos = this.todosLosProductos.filter(
      (p) => (p.existencia ?? 0) === 0
    );
  } else {
    this.productos = [...this.todosLosProductos];
  }

  this.cdr.detectChanges();
  }
}
