import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-cerrar-caja',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './cerrar-caja.html',
  styleUrls: ['./cerrar-caja.scss']
})
export class CerrarCajaComponent {
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