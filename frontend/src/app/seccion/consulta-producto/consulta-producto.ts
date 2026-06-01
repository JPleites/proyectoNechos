import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet, RouterModule } from "@angular/router";

@Component({
  selector: 'app-consulta-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterModule],
  templateUrl: './consulta-producto.html',
  styleUrls: ['./consulta-producto.scss']
})
export class ConsultaProductoComponent {
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