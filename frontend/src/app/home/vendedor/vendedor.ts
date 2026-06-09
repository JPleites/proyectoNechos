import { Component } from '@angular/core';

@Component({
  selector: 'app-vendedor',
  imports: [],
  templateUrl: './vendedor.html',
  styleUrl: './vendedor.scss',
})
export class Vendedor {
  nombre: string = localStorage.getItem('nombre') || 'Usuario';
  navigateTo(modulo: string) {
    if (modulo) {
      window.location.href = modulo;
    }
  }
  
  logout() {
    localStorage.clear();
    location.href = '/login';
  }
}
