import { Component } from '@angular/core';

@Component({
  selector: 'app-supervisor',
  imports: [],
  templateUrl: './supervisor.html',
  styleUrl: './supervisor.scss',
})
export class Supervisor {
  logout() {
    localStorage.clear();
    location.href = '/login';
  }
}
