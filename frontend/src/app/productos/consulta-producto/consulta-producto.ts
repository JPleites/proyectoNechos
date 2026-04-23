import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consulta-producto',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './consulta-producto.html',
  styleUrl: './consulta-producto.scss',
})
export class ConsultaProducto implements OnInit {
  productos: any[] = [];

  constructor(private productosService: ProductosService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        console.log('PRODUCTOS:', data);
        this.productos = data; // Aseguramos que data se trate como un array de productos
      },
      error: (err) => {
        console.error('ERROR API:', err);
      },
    });
  }
  busqueda: string = '';

  buscar() {
    if (!this.busqueda) {
      this.cargarProductos();
      return;
    }

    this.productosService.buscarProductos(this.busqueda).subscribe((data: any) => {
      this.productos = data;
    });
  }

  eliminar(codigo: string) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService.deleteProducto(codigo).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El producto fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false,
            });

            this.cargarProductos();
          },

          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el producto',
            });
          },
        });
      }
    });
  }
}
