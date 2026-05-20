import { Component } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-cliente',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-cliente.html',
  styleUrl: './crear-cliente.scss',
})
export class CrearCliente {
  cliente = {
    id: '',
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
  };

  constructor(private clientesService: ClientesService) {}

  guardar() {
    if (!this.cliente.id || !this.cliente.nombre || !this.cliente.correo) {
      Swal.fire('Error', 'Completa los campos obligatorios', 'warning');
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.clientesService.crearCliente(this.cliente).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente creado',
          timer: 1500,
          showConfirmButton: false
        });
        this.cliente = { id: '', nombre: '', correo: '', telefono: '', direccion: '' };
      },
      error: () => {
        Swal.fire('Error', 'Ocurrió un error al crear el cliente', 'error');
      }
    });
  }

}
