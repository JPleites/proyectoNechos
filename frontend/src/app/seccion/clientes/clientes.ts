import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLinkWithHref, RouterLink, RouterModule } from '@angular/router';


@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLinkWithHref, RouterLink, RouterModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent {
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