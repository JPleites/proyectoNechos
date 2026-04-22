import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [ReactiveFormsModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      codigo: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor llena todos los campos',
      });
      return;
    }

    this.loading = true;

    this.api.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        // 🔐 Guardar datos
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('rol', res.rol);

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.redirigirPorRol(res.rol);
        });

        this.loginForm.reset();
        this.loading = false;
      },

      error: (err) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Credenciales incorrectas',
        });

        console.error('Error login', err);
      },
    });
  }

  // 🔥 Función limpia
  redirigirPorRol(rol: string) {
    const rutas: any = {
      admin: '/admin',
      cajero: '/cajero',
      supervisor: '/supervisor',
      vendedor: '/vendedor',
    };

    this.router.navigate([rutas[rol] || '/login']);
  }
}
