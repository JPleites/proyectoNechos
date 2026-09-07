import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcaService } from '../../services/marca.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consulta-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-marcas.html',
  styleUrl: './consulta-marcas.scss',
})
export class ConsultaMarcas implements OnInit {
  marcas: any[] = [];
  marcasFiltradas: any[] = [];

  proveedores: any[] = [];

  busqueda: string = '';
  proveedorSeleccionado: string = '';

  constructor(
    private marcaService: MarcaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarMarcas();
  }

  cargarMarcas() {
    this.marcaService.getMarcas().subscribe({
      next: (res: any) => {
        this.marcas = res ?? [];
        this.marcasFiltradas = this.marcas;

        // Obtener proveedores únicos
        this.proveedores = Array.from(
          new Map(
            this.marcas
              .filter((m) => m.proveedorRel)
              .map((m) => [m.proveedorRel.id, m.proveedorRel]),
          ).values(),
        );

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  aplicarFiltros() {
    const texto = this.busqueda.trim().toLowerCase();

    this.marcasFiltradas = this.marcas.filter((m) => {
      const coincideTexto =
        !texto ||
        m.nombre?.toLowerCase().includes(texto) ||
        m.marcaID?.toLowerCase().includes(texto);

      const coincideProveedor =
        !this.proveedorSeleccionado ||
        String(m.proveedorRel?.id) === String(this.proveedorSeleccionado);

      return coincideTexto && coincideProveedor;
    });
  }

  limpiarFiltros() {
    this.busqueda = '';
    this.proveedorSeleccionado = '';
    this.marcasFiltradas = this.marcas;
  }
}
