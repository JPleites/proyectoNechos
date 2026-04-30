import { Component } from '@angular/core';

@Component({
  selector: 'app-vendedor',
  imports: [],
  templateUrl: './vendedor.html',
  styleUrl: './vendedor.scss',
})
export class Vendedor {
  logout() {
    localStorage.clear();
    location.href = '/login';
  }
}
