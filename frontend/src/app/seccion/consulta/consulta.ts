import { Component } from '@angular/core';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';

@Component({
  selector: 'app-consulta',
  imports: [MdbFormsModule],
  templateUrl: './consulta.html',
  styleUrl: './consulta.scss',
})
export default class Consulta {
  title = 'mdb-angular-ui-kit-free';
  search(value: string) {
    console.log(value);
  }

   filtrarTeclas(event: KeyboardEvent): void {
  // 1. Permitir teclas de control (Borrar, Tabulador, Flechas, Enter)
  const teclasPermitidas = [
    'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'
  ];

  // 2. Si la tecla presionada está en la lista de permitidas, la dejamos pasar
  if (teclasPermitidas.includes(event.key)) {
    return;
  }

  // 3. Si la tecla NO es un número (del 0 al 9), bloqueamos la acción
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
}

}

