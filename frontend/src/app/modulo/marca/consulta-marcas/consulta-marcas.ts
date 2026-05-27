import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcaService } from '../../services/marca.service';

@Component({
  selector: 'app-consulta-marcas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consulta-marcas.html',
  styleUrl: './consulta-marcas.scss',
})
export class ConsultaMarcas implements OnInit {

  marcas: any[] = [];
  marcasFiltradas: any[] = [];

  busqueda: string = '';

  constructor(private marcaService: MarcaService) {}

  ngOnInit() {
    this.cargarMarcas();
  }

  cargarMarcas() {
    this.marcaService.getMarcas().subscribe({
      next: (res: any) => {
        this.marcas = res ?? [];
        this.marcasFiltradas = this.marcas;
      },
      error: (err) => console.error(err),
    });
  }

  buscar() {
    const texto = this.busqueda.toLowerCase();

    this.marcasFiltradas = this.marcas.filter(m =>
      m.nombre.toLowerCase().includes(texto) ||
      m.proveedorRel?.proveedor?.toLowerCase().includes(texto)
    );
  }
}