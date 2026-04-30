import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './caja.html',
  styleUrls: ['./caja.scss']
})
export class CajaComponent {
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

  onExample1() { console.log('Acción 1 ejecutada'); }
  onExample2() { console.log('Acción 2 ejecutada'); }
}