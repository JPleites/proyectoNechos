import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-arqueos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './arqueos.html',
  styleUrls: ['./arqueos.scss']
})
export class ArqueosComponent {
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

  onExample1() { console.log('Acción 1 ejecutada'); }
  onExample2() { console.log('Acción 2 ejecutada'); }
}