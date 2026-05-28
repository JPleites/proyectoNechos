import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';
import { CommonModule } from '@angular/common';
import { ProveedoresService } from '../../services/proveedores.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-consulta-categoria',
  imports: [CommonModule, RouterLink],
  templateUrl: './consulta-categoria.html',
  styleUrl: './consulta-categoria.scss',
})
export class ConsultaCategoria implements OnInit {
  categorias: any[] = [];
  proveedores: any[] = []; // lista global
  categoriaSeleccionada: string = '';
  proveedorSeleccionado: string = '';
  categoriasFiltradas: any[] = [];

  constructor(
    private service: CategoriasService,
    private proveedoresService: ProveedoresService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarProveedores();
  }

  cargar() {
    this.service.getCategorias().subscribe((data: any) => {
      this.categorias = data;
      this.cdr.detectChanges();
      this.categoriasFiltradas = data;
    });
  }

  filtrar() {
    this.categoriasFiltradas = this.categorias.filter((c) => {
      const cumpleCategoria = !this.categoriaSeleccionada || c.id === this.categoriaSeleccionada;

      const cumpleProveedor =
        !this.proveedorSeleccionado || c.proveedorId === this.proveedorSeleccionado;

      return cumpleCategoria && cumpleProveedor;
    });
  }

  limpiarFiltros() {
    this.categoriaSeleccionada = '';
    this.proveedorSeleccionado = '';
    this.categoriasFiltradas = this.categorias;
  }

  cargarProveedores() {
    this.proveedoresService.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
      this.cdr.detectChanges();
    });
  }

  eliminar(id: string) {
    this.service.eliminarCategoria(id).subscribe(() => {
      this.cargar();
    });
  }
}
