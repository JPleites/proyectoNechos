import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet, RouterModule } from "@angular/router";

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class ProductosComponent {
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