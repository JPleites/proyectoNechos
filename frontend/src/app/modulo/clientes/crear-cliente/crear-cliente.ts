import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 👈 Importaciones clave
import { ClientesService } from '../../services/clientes.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-cliente',
  imports: [ReactiveFormsModule, CommonModule], // 👈 Cambiamos FormsModule por ReactiveFormsModule
  templateUrl: './crear-cliente.html',
  styleUrl: './crear-cliente.scss',
})
export class CrearCliente{
  // Definimos el FormGroup
  clienteForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private clientesService: ClientesService
  ) {
    this.clienteForm = this.fb.group({
      rtn: ['', [Validators.required], Validators.minLength(13), Validators.maxLength(14)],
      nombre: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.maxLength(8), Validators.pattern('^[0-9]*$'), Validators.minLength(8)]],
      direccion: ['']
    });
  }

  guardar() {
    if (this.clienteForm.invalid) {
      Swal.fire('Error', 'Completa los campos obligatorios correctamente', 'warning');
      return;
    }

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.clientesService.crearCliente(this.clienteForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente creado',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.limpiarFormulario();
        });
      },
      error: () => {
        Swal.fire('Error', 'Ocurrió un error al crear el cliente', 'error');
      }
    });
  }

  limpiarFormulario() {
    this.clienteForm.reset();
  }
}