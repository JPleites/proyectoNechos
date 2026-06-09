import { Component } from '@angular/core';

@Component({
  selector: 'app-supervisor',
  imports: [],
  templateUrl: './supervisor.html',
  styleUrl: './supervisor.scss',
})
export class Supervisor {
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
