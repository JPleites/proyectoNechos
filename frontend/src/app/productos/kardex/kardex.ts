import { Component } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kardex',
  imports: [FormsModule, CommonModule],
  templateUrl: './kardex.html',
  styleUrl: './kardex.scss',
})
export class Kardex {
  codigo: string = '';
  movimientos: any[] = [];

  constructor(private inventarioService: InventarioService) {}

  buscar() {
    const codigo = this.codigo.trim();

    if (!codigo) {
      this.movimientos = [];
      return;
    }

    this.inventarioService.getKardex(codigo).subscribe({
      next: (data: any) => {
        this.movimientos = data.kardex || [];
      },
      error: (err) => {
        console.error(err);
        this.movimientos = [];
      },
    });
  }
}
