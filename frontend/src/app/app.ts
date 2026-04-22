import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.getProductos().subscribe({
      next: (data) => console.log('Productos:', data),
      error: (err) => console.error(err)
    });
  }
}
