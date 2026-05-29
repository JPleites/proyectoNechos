import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recibo',
  imports: [CommonModule],
  templateUrl: './recibo.html',
  styleUrl: './recibo.scss',
})
export class ReciboComponent {
  @Input() venta: any;
  @Input() pedidoVendedor: string = '';
}
