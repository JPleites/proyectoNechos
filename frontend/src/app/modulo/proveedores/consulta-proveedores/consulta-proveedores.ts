import { Component, OnInit } from '@angular/core';
import { ProveedoresService } from '../../services/proveedores.service';
import { CategoriasService } from '../../services/categorias.service';
import { CategoriaProveedoresService } from '../../services/categoria-proveedores.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-proveedores',
  imports: [CommonModule],
  templateUrl: './consulta-proveedores.html',
  styleUrl: './consulta-proveedores.scss',
})
export class ConsultaProveedores implements OnInit {
  proveedores: any[] = [];
  categorias: any[] = [];
  categoriasProveedor: any[] = [];
  proveedorSeleccionado: any = null;
  mostrarModal = false;
  categoriasSeleccionadas: string[] = [];

  constructor(
    private service: ProveedoresService,
    private categoriaService: CategoriasService,
    private categoriaProveedoresService: CategoriaProveedoresService,
  ) {}
  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getProveedores().subscribe((data: any) => {
      this.proveedores = data;
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe((data: any) => {
      this.categorias = data;
    });
  }

  abrirCategorias(proveedor: any) {
    this.proveedorSeleccionado = proveedor;
    this.mostrarModal = true;

    // 🔥 limpiar antes de cargar
    this.categoriasSeleccionadas = [];

    this.categoriaService.getCategorias().subscribe((cats: any) => {
      this.categorias = cats;

      this.categoriaProveedoresService
        .getCategoriasProveedor(proveedor.rtn)
        .subscribe((rel: any) => {
          this.categoriasSeleccionadas = rel.map((r: any) => r.categoriaId);
        });
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.proveedorSeleccionado = null;
    this.categoriasSeleccionadas = [];
  }

  toggleCategoria(id: string, checked: boolean) {
    if (checked) {
      if (!this.categoriasSeleccionadas.includes(id)) {
        this.categoriasSeleccionadas.push(id);
      }
    } else {
      this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter((c) => c !== id);
    }
  }

  guardarCategorias() {
    if (!this.proveedorSeleccionado) return;

    this.categoriaProveedoresService
      .asignarCategorias({
        proveedorRtn: this.proveedorSeleccionado.rtn,
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

  // eliminar(rtn: string) {
  //   Swal.fire({
  //     title: '¿Eliminar proveedor?',
  //     text: 'Esta acción no se puede deshacer',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#dc3545',
  //     cancelButtonColor: '#6c757d',
  //     confirmButtonText: 'Sí, eliminar',
  //     cancelButtonText: 'Cancelar',
  //     reverseButtons: true,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       Swal.fire({
  //         title: 'Eliminando...',
  //         allowOutsideClick: false,
  //         didOpen: () => Swal.showLoading(),
  //       });

  //       this.service.eliminarProveedor(rtn).subscribe({
  //         next: () => {
  //           Swal.fire({
  //             icon: 'success',
  //             title: 'Eliminado',
  //             timer: 1500,
  //             showConfirmButton: false,
  //           });

  //           this.cargar();
  //         },
  //         error: () => {
  //           Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
  //         },
  //       });
  //     }
  //   });
  // }
}
