import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-consulta-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './consulta-producto.html',
  styleUrls: ['./consulta-producto.scss']
})
export class ConsultaProductoComponent {
  sidebarOpen = true;
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