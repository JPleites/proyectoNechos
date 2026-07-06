import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.service';
import { AlmacenesService } from '../../services/almacenes.service';
import { CommonModule } from '@angular/common';

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
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      productoCodigo: [''],
      ubicacion: [''],
      almacenId: [''],
    });
  }

  ngOnInit(): void {
    this.almacenesService.getAlmacenes().subscribe({
      next: (res) => {
        this.almacenes = res;
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
    this.cargando = true;

    this.inventarioService.consultaInventario(this.form.value).subscribe({
      next: (res: any) => {
        this.data = res.inventario ?? res;

        // si backend manda resumen
        if (res.resumen) {
          this.resumen = res.resumen;
        } else {
          this.calcularResumen();
        }

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
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
