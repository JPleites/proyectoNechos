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
  marcaRel?: any;
  categoriaRel?: any;
  proveedorRel?: any;
  descripcion?: string;
}

interface Inventario {
  ubicacion: string;
  cantidad: number;
}

@Component({
  selector: 'app-consulta-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './consulta-producto.html',
  styleUrl: './consulta-producto.scss',
})
export class ConsultaProducto implements OnInit {
  productos: Producto[] = [];
  inventarios: Record<string, Inventario[]> = {};
  stockMap: Record<string, number> = {};
  inventarioVisible: string | null = null;
  busqueda: string = '';
  filtros = {
    q: '',
    categoriaId: '',
    proveedorId: '',
    marcaId: '',
  };
  categorias: any[] = [];
  proveedores: any[] = [];
  marcas: any[] = [];

  constructor(
    private productosService: ProductosService,
    private inventarioService: InventarioService,
    private categoriasService: CategoriasService,
    private proveedoresService: ProveedoresService,
    private marcaService: MarcaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarFiltros();
  }

  // 🔥 CARGA PRODUCTOS
  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data ?? [];
        this.stockMap = {};
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err),
    });
  }

  // 🔥 BUSQUEDA OPTIMIZADA
  // buscar() {
  //   if (!this.busqueda) {
  //     this.cargarProductos();
  //     return;
  //   }

  //   this.productosService.buscarProductos(this.busqueda).subscribe({
  //     next: (data: Producto[]) => {
  //       this.productos = data ?? [];
  //       this.stockMap = {}; // reset limpio
  //     },
  //     error: (err: any) => console.error(err),
  //   });
  // }

  // 🔥 INVENTARIO POR PRODUCTO
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
        const inventario: Inventario[] = Array.isArray(res) ? res : (res?.inventario ?? []);

        this.inventarios[codigo] = inventario;
        this.inventarioVisible = codigo;

        this.stockMap[codigo] = this.calcularStock(inventario);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  // 🔥 CALCULAR TODOS LOS STOCKS
  private calcularStock(inventario: Inventario[]): number {
    return inventario.reduce((total, item) => total + (item.cantidad || 0), 0);
  }

  cargarFiltros() {
    this.categoriasService.getCategorias().subscribe((data: any) => {
      this.categorias = data;
    });

    this.proveedoresService.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
    });

    this.marcaService.getMarcas().subscribe((data: any) => {
      this.marcas = data;
    });
    this.cdr.detectChanges();
  }

  aplicarFiltros() {
    this.productosService.filtrosProductos(this.filtros).subscribe({
      next: (data: any) => {
        this.productos = data ?? [];
        this.stockMap = {};
        console.log('Productos filtrados:', this.productos);
      },
      error: (err) => console.error(err),
    });
  }
}
