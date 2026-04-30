import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para que funcione el HTML

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent {
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