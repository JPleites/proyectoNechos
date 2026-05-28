import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProveedoresService } from '../../services/proveedores.service';
import { CategoriasService } from '../../services/categorias.service';
import { CategoriaProveedoresService } from '../../services/categoria-proveedores.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Proveedor {
  id: number;
  proveedorID: string;
  rtn: string;
  proveedor: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-consulta-proveedores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consulta-proveedores.html',
  styleUrl: './consulta-proveedores.scss',
})
export class ConsultaProveedores implements OnInit {
  proveedores: Proveedor[] = [];
  categorias: Categoria[] = [];

  proveedorSeleccionado: Proveedor | null = null;

  mostrarModal = false;

  categoriasSeleccionadas: number[] = [];

  constructor(
    private service: ProveedoresService,
    private categoriaService: CategoriasService,
    private categoriaProveedoresService: CategoriaProveedoresService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  // 📦 Cargar proveedores
  cargarProveedores() {
    this.service.getProveedores().subscribe({
      next: (data: Proveedor[]) => {
        this.proveedores = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  // 📦 Abrir modal
  abrirCategorias(proveedor: Proveedor) {
    this.proveedorSeleccionado = proveedor;
    this.mostrarModal = true;
    this.categoriasSeleccionadas = [];

    // 🔥 cargar categorías
    this.categoriaService.getCategorias().subscribe({
      next: (cats: Categoria[]) => {
        this.categorias = cats;
        this.cdr.detectChanges();

        // 🔥 categorías del proveedor (YA CON ID)
        this.categoriaProveedoresService.getCategoriasProveedor(proveedor.id).subscribe({
          next: (rel: any[]) => {
            this.categoriasSeleccionadas = rel.map((r) => r.categoriaId);
          },
          error: () => {
            this.categoriasSeleccionadas = [];
          },
        });
      },
    });
  }

  // ❌ cerrar modal
  cerrarModal() {
    this.mostrarModal = false;
    this.proveedorSeleccionado = null;
    this.categoriasSeleccionadas = [];
  }

  // ☑️ toggle categoría
  toggleCategoria(id: number, checked: boolean) {
    if (checked) {
      if (!this.categoriasSeleccionadas.includes(id)) {
        this.categoriasSeleccionadas.push(id);
      }
    } else {
      this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter((c) => c !== id);
    }
  }

  // 💾 guardar cambios
  guardarCategorias() {
    if (!this.proveedorSeleccionado) return;

    this.categoriaProveedoresService
      .asignarCategorias({
        proveedorId: this.proveedorSeleccionado.id,
        categorias: this.categoriasSeleccionadas,
      })
      .subscribe({
        next: () => {
          Swal.fire('Éxito', 'Categorías actualizadas', 'success');
          this.cerrarModal();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo guardar', 'error');
        },
      });
  }
}
