import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.scss']
})
export class CategoriasComponent {
  sidebarOpen = false;

  rol = localStorage.getItem('rol');

  constructor(private router: Router) {}

  onBack() {
    this.redirigirPorRol(this.rol || '');
  }

  redirigirPorRol(rol: string) {
    const rutas: any = {
      admin: '/admin',
      cajero: '/cajero',
      supervisor: '/supervisor',
      vendedor: '/vendedor',
    };

    this.router.navigate([rutas[rol] || '/login']);
  }
}