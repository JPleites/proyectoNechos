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
  descripcion?: string;
  costoCompra?: number;
  costoVenta?: number;
  productoID?: number;
  codigoProveedor?: string;
  codigoProducto?: string;
}

interface Inventario {
  ubicacion: string;
  cantidad: number;
}

@Component({
  selector: 'app-gestion-productos',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.scss',
})
export class GestionProductos implements OnInit {

  productos: Producto[] = [];

  inventarios: Record<string, Inventario[]> = {};
  stockMap: Record<string, number> = {};

  inventarioVisible: string | null = null;

  filtros = {
    q: '',
    categoriaId: '',
    proveedorId: '',
    marcaId: '',
  };

  categorias: any[] = [];
  proveedores: any[] = [];
  marcas: any[] = [];

  selectedProduct: Producto | null = null;
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
        this.productos = data ?? [];
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
  // STOCK (opcional si lo sigues usando en otro lado)
  // =========================
  verInventario(codigo: string) {
    if (this.inventarioVisible === codigo) {
      this.inventarioVisible = null;
      return;
    }

    if (this.inventarios[codigo]) {
      this.inventarioVisible = codigo;
      this.stockMap[codigo] = this.calcularStock(this.inventarios[codigo]);
      this.cdr.detectChanges();
      return;
    }

    this.inventarioService.getInventarioPorProducto(codigo).subscribe({
      next: (res: any) => {
        const inventario: Inventario[] =
          Array.isArray(res) ? res : (res?.inventario ?? []);

        this.inventarios[codigo] = inventario;
        this.inventarioVisible = codigo;

        this.stockMap[codigo] = this.calcularStock(inventario);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  private calcularStock(inventario: Inventario[]): number {
    return inventario.reduce((total, item) => total + (item.cantidad || 0), 0);
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
}