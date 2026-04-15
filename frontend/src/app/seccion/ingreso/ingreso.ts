import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';  

@Component({
  selector: 'app-ingreso',
  imports: [ReactiveFormsModule, MdbFormsModule, MdbValidationModule],
  templateUrl: './ingreso.html',
  styleUrl: './ingreso.scss',
})
export class Ingreso {
  validationForm: FormGroup;

  constructor() {
    this.validationForm = new FormGroup({
      firstName: new FormControl(null, { validators: Validators.required, updateOn: 'submit' }),
      lastName: new FormControl(null, { validators: Validators.required, updateOn: 'submit' }),
    });
  }

  get firstName(): AbstractControl {
    return this.validationForm.get('firstName')!;
  }

  get lastName(): AbstractControl {
    return this.validationForm.get('lastName')!;
  }

  onSubmit(): void {
    this.validationForm.markAllAsTouched();
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
