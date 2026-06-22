import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';
import { CommonModule } from '@angular/common';
import { ProveedoresService } from '../../services/proveedores.service';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consulta-categoria',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './consulta-categoria.html',
  styleUrl: './consulta-categoria.scss',
})
export class ConsultaCategoria implements OnInit {
  categorias: any[] = [];
  proveedores: any[] = []; // lista global
  categoriaSeleccionada: string = '';
  proveedorSeleccionado: string = '';
  busqueda: string = '';

  constructor(
    private service: CategoriasService,
    private proveedoresService: ProveedoresService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarProveedores();
  }

  get categoriasFiltradas(): any[] {
  if (!this.busqueda.trim()) return this.categorias;
  const q = this.busqueda.toLowerCase();
  return this.categorias.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.categoriaID.toLowerCase().includes(q) ||
    c.subCategorias?.some((s: any) => s.nombre.toLowerCase().includes(q))
  );
}

  cargar() {
    this.service.getCategorias().subscribe((data: any) => {
      this.categorias = data;
      this.cdr.detectChanges();
    });
  }

  limpiarFiltros() {
    this.categoriaSeleccionada = '';
    this.proveedorSeleccionado = '';
  }

  cargarProveedores() {
    this.proveedoresService.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
      this.cdr.detectChanges();
    });
  }

  eliminar(id: string) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.eliminarCategoria(id).subscribe({
        next: () => this.cargar(),
        error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error'),
      });
    });
  }

  eliminarSubCategoria(subId: number, categoriaId: number) {
    Swal.fire({
      title: '¿Eliminar subcategoría?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.eliminarSubCategoria(subId).subscribe({
        next: () => this.cargar(),
        error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error'),
      });
    });
  }
}
