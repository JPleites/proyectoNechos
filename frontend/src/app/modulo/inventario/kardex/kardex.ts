import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { ProductosService } from '../../services/productos.service';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kardex',
  imports: [FormsModule, CommonModule],
  templateUrl: './kardex.html',
  styleUrl: './kardex.scss',
})
export class Kardex implements OnInit {
  codigo: string = '';
  ubicacion: string = '';

  productos: any[] = [];
  ubicaciones: any[] = [];

  movimientos: any[] = [];

  productoSeleccionado: any = null;
  ubicacionSeleccionada: any = null;

  cargando = false;

  constructor(
    private inventarioService: InventarioService,
    private productosService: ProductosService,
    private ubicacionesService: UbicacionesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarUbicaciones();
  }


  // ==========================================
  // CARGAR UBICACIONES
  // ==========================================

  cargarUbicaciones() {
    this.ubicacionesService.getUbicaciones().subscribe({
      next: (data: any[]) => {
        this.ubicaciones = data ?? [];
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error cargando ubicaciones:', err);
        this.ubicaciones = [];
      },
    });
  }

  // ==========================================
  // BUSCAR KARDEX
  // ==========================================

  buscar() {
    const codigo = this.codigo.trim();
    const ubicacion = this.ubicacion.trim();

    if (!codigo && !ubicacion) {
      this.movimientos = [];
      return;
    }

    this.cargando = true;

    this.inventarioService.getKardex(codigo || undefined, ubicacion || undefined).subscribe({
      next: (data: any) => {
        this.movimientos = data?.kardex ?? [];

        this.productoSeleccionado = data?.producto
          ? {
              codigo: data.codigo,
              producto: data.producto,
            }
          : null;

        this.ubicacionSeleccionada = data?.ubicacion ?? null;

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error obteniendo Kardex:', err);

        this.movimientos = [];
        this.productoSeleccionado = null;
        this.ubicacionSeleccionada = null;
        this.cargando = false;

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // LIMPIAR
  // ==========================================

  limpiar() {
    this.codigo = '';
    this.ubicacion = '';

    this.movimientos = [];

    this.productoSeleccionado = null;
    this.ubicacionSeleccionada = null;

    this.cargando = false;

    this.cdr.detectChanges();
  }
}
