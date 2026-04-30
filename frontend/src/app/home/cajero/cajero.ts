import { Component } from '@angular/core';

@Component({
  selector: 'app-cajero',
  imports: [],
  templateUrl: './cajero.html',
  styleUrl: './cajero.scss',
})
export class Cajero {
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
