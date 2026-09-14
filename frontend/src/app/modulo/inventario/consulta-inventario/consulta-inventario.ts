import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { CommonModule } from '@angular/common';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-consulta-inventario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-inventario.html',
  styleUrl: './consulta-inventario.scss',
})
export class ConsultaInventario implements OnInit {
  form: FormGroup;
  data: any[] = [];
  cargando = false;
  almacenes: any[] = [];
  ubicaciones: any[] = [];
  categorias: any[] = [];
  subCategorias: any[] = [];

  resumen = {
    registros: 0,
    stockTotal: 0,
    productos: 0,
    ubicaciones: 0,
  };

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private almacenesService: AlmacenesService,
    private categoriasService: CategoriasService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      productoCodigo: [''],
      producto: [''],
      ubicacion: [''],
      almacenId: [''],
      categoriaId: [''],
      subCategoriaId: [''],
    });
  }

  ngOnInit(): void {
    this.almacenesService.getAlmacenes().subscribe({
      next: (res) => {
        this.almacenes = res;
        this.cdr.detectChanges();
      },
    });
    this.categoriasService.getCategorias().subscribe({
      next: (res) => {
        this.categorias = res;
        this.cdr.detectChanges();
      },
    });
  }

  cargarSubCategorias() {
    const categoriaId = this.form.get('categoriaId')?.value;

    if (!categoriaId) {
      this.subCategorias = [];
      return;
    }

    this.categoriasService.getSubCategorias(categoriaId).subscribe({
      next: (res: any) => {
        this.subCategorias = res;
        this.cdr.detectChanges();
      },
    });
  }

  cargarUbicaciones() {
    const almacenId = this.form.get('almacenId')?.value;

    if (!almacenId) {
      this.ubicaciones = [];
      return;
    }

    this.inventarioService.getUbicacionesDisponibles(almacenId, '').subscribe({
      next: (res: any) => {
        this.ubicaciones = res;
        this.cdr.detectChanges();
      },
    });
  }

  buscar() {
    const raw = this.form.value;

    const params: any = {};

    if (raw.productoCodigo?.trim()) {
      params.productoCodigo = raw.productoCodigo.trim();
    }

    if (raw.producto?.trim()) {
      params.producto = raw.producto.trim();
    }

    if (raw.ubicacion?.trim()) {
      params.ubicacion = raw.ubicacion.trim();
    }

    if (raw.almacenId) {
      params.almacenId = Number(raw.almacenId);
    }

    if (raw.categoriaId) {
      params.categoria = Number(raw.categoriaId);
    }

    if (raw.subCategoriaId) {
      params.subCategoria = Number(raw.subCategoriaId);
    }

    this.inventarioService.consultaInventario(params).subscribe({
      next: (res: any) => {
        this.data = res;
        this.calcularResumen();
        this.cdr.detectChanges();
      },
    });
  }

  limpiar() {
    this.form.reset();
    this.buscar();
  }

  calcularResumen() {
    this.resumen.registros = this.data.length;
    this.resumen.stockTotal = this.data.reduce((a, b) => a + (b.cantidad || 0), 0);
    this.resumen.productos = new Set(this.data.map((x) => x.productoCodigo)).size;
    this.resumen.ubicaciones = new Set(this.data.map((x) => x.ubicacion)).size;
  }
}
