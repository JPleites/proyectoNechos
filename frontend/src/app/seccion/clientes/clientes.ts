import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para que funcione el HTML

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent {
  sidebarOpen = true;

  // Funciones simplificadas
  onBack() { 
    console.log('Regresando...');
    // Aquí podrías usar el router.navigate si lo inyectas
  }

  onExample1() { console.log('Acción 1 ejecutada'); }
  onExample2() { console.log('Acción 2 ejecutada'); }
  
  navigate(modulo: any) {
    console.log('Navegando a:', modulo.label);
  }
}