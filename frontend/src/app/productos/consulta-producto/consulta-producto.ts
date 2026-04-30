import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { InventarioService } from '../../services/inventario.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Producto {
  codigo: string;
  producto: string;
  precio: number;
  marca?: string;
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
  inventarios: { [codigo: string]: Inventario[] } = {};
  stockMap: { [codigo: string]: number } = {};
  inventarioVisible: string | null = null;
  busqueda: string = '';

  constructor(
    private productosService: ProductosService,
    private inventarioService: InventarioService,
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  // 🔥 CARGA PRODUCTOS
  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data ?? [];
        this.calcularStocks(); // 🔥 importante
      },
      error: (err) => {
        console.error('ERROR API:', err);
      },
    });
  }

  // 🔥 BUSQUEDA OPTIMIZADA
  buscar() {
    if (!this.busqueda) {
      this.cargarProductos();
      return;
    }

    this.productosService.buscarProductos(this.busqueda).subscribe({
      next: (data: Producto[] | any) => {
        this.productos = data ?? [];
        this.calcularStocks();
      },
      error: (err) => console.error(err),
    });
  }

  // 🔥 INVENTARIO POR PRODUCTO
  verInventario(codigo: string) {

    if (this.inventarioVisible === codigo) {
      this.inventarioVisible = null;
      return;
    }

    if (this.inventarios[codigo]) {
      this.inventarioVisible = codigo;
      return;
    }

    this.inventarioService.getInventarioPorProducto(codigo).subscribe({
      next: (res: any) => {

        const data = Array.isArray(res)
          ? res
          : res.inventario ?? [];

        this.inventarios[codigo] = data;
        this.inventarioVisible = codigo;

        this.calcularStockProducto(codigo);
      },
      error: (err) => console.error(err),
    });
  }

  // 🔥 CALCULAR TODOS LOS STOCKS
  calcularStocks() {
    this.productos.forEach(p => {
      const inventario = this.inventarios[p.codigo] || [];
      this.stockMap[p.codigo] = inventario.reduce(
        (total, item) => total + (item.cantidad || 0),
        0
      );
    });
  }

  // 🔥 SOLO UNO (cuando carga inventario nuevo)
  calcularStockProducto(codigo: string) {
    const inventario = this.inventarios[codigo] || [];
    this.stockMap[codigo] = inventario.reduce(
      (total, item) => total + (item.cantidad || 0),
      0
    );
  }
}