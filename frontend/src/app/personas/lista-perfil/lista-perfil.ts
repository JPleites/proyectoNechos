import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../services/perfil.service';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-perfil',
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-perfil.html',
  styleUrl: './lista-perfil.scss',
})
export class ListaPerfil {
  perfiles: any[] = [];

  constructor(
    private perfilService: PerfilService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cargar();
  }

  crearPerfil() {
    this.router.navigate(['/usuarios/crear-perfil']);
  }

  cargar() {
    this.perfilService.getPerfiles().subscribe((res: any) => {
      console.log('Perfiles:', res);
      this.perfiles = [...res];
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/perfil', id]);
  }

  editar(id: number) {
    this.router.navigate(['/perfil/editar', id]);
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar colaborador?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.perfilService.deletePerfil(id).subscribe(() => {
          this.cargar();
        });
      }
    });
  }

  crearUsuario(perfil: any) {
    Swal.fire({
      title: 'Crear usuario',
      text: `Crear acceso para ${perfil.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
    }).then((result) => {
      if (result.isConfirmed) {
        this.perfilService.crearUsuario(perfil.id, { contrasena: '123456', rol: 'vendedor' }).subscribe(() => {
          this.cargar();
        });
      }
    });
  }
}
