import { Component, ChangeDetectorRef } from '@angular/core';
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

  constructor(private inventarioService: InventarioService, private cdr: ChangeDetectorRef) {}

  buscar() {
    const codigo = this.codigo.trim();

    if (!codigo) {
      this.movimientos = [];
      return;
    }

    this.inventarioService.getKardex(codigo).subscribe({
      next: (data: any) => {
        let saldo = 0;

        this.movimientos = data.kardex.map((m: any) => {
          if (m.tipo === 'ENTRADA') {
            saldo += m.cantidad;
          } else {
            saldo -= m.cantidad;
          }

          return {
            ...m,
            saldo,
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.movimientos = [];
      },
    });
  }
}
