import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para que funcione el HTML
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './almacenes.html',
  styleUrls: ['./almacenes.scss']
})
export class AlmacenesComponent {
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