import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Devolucion } from '../../services/devoluciones';

@Component({
  selector: 'app-recibo-devolucion',
  imports: [CommonModule],
  templateUrl: './recibo-devolucion.html',
  styleUrl: './recibo-devolucion.scss',
})
export class ReciboDevolucionComponent {
  @Input() devolucion!: Devolucion;
}
