import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
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
