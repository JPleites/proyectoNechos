import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../../services/perfil.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crear-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-perfil.html',
  styleUrl: './crear-perfil.scss',
})
export class CrearPerfil {
  form: FormGroup;
  modo: 'crear' | 'editar' = 'crear';
  perfilId: number | null = null;
  cargos: string[] = [];
  municipiosFiltrados: string[] = [];

  departamento = [
    'Cortés',
    'Atlántida',
    'Santa Bárbara',
    'Yoro',
    'Colón',
    'Gracias a Dios',
    'Islas de la Bahía',
    'Olancho',
    'El Paraíso',
    'Intibucá',
    'Lempira',
    'Ocotepeque',
    'Copán',
    'Valle',
    'La Paz',
    'Francisco Morazán',
    'Comayagua',
    'Choluteca',
  ];

  administracion = ['Gerente', 'Supervisor de tienda'];
  atencionAlCliente = ['Cajero', 'Vendedor', 'Bodeguero'];
  taller = ['Administrador de taller', 'Jefe de taller', 'Mecánico', 'Ayudante de taller'];

  ngOnInit() {
    this.perfilId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.perfilId) {
      this.modo = 'editar';
      this.cargarPerfil(this.perfilId);
    }
  }
  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      dni: ['', Validators.required, Validators.minLength(13), Validators.maxLength(13)],
      nombre: ['', Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)],
      telefono: ['', Validators.required, Validators.pattern(/^\d{8}$/)],
      cargo: ['', Validators.required],
      departamento: ['', Validators.required],
      dir_departamento: [''],
      dir_municipio: [''],
      dir_barrio: [''],
      direccion: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      fechaUltimoAscenso: ['', Validators.required],

      crearUsuario: [false],

      rol: [''],
      contrasena: [''],
    });

    // 🔥 lógica: si NO quiere usuario, limpiar campos
    this.form.get('crearUsuario')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.form.patchValue({
          rol: '',
          contrasena: '',
        });
      }
    });

    this.form.get('departamento')?.valueChanges.subscribe((departamento) => {
      this.form.patchValue({ cargo: '' });

      switch (departamento) {
        case 'administracion':
          this.cargos = this.administracion;
          break;

        case 'atencionAlCliente':
          this.cargos = this.atencionAlCliente;
          break;

        case 'taller':
          this.cargos = this.taller;
          break;

        default:
          this.cargos = [];
          break;
      }
    });

    this.form.get('dir_departamento')?.valueChanges.subscribe((departamento) => {
  // reset municipio siempre
  this.form.patchValue({ dir_municipio: '' });

  if (departamento === 'Cortés') {
    this.municipiosFiltrados = [
      'San Pedro Sula',
      'Choloma',
      'Puerto Cortés',
      'Omoa',
      'La Lima',
      'San Manuel',
      'Villanueva',
      'Pimienta',
      'Potrerillos',
      'San Francisco de Yojoa',
      'San Antonio de Cortés',
      'Santa Cruz de Yojoa',
    ];
  } else {
    this.municipiosFiltrados = [];
  }
});
  }

  cargarPerfil(id: number) {
    this.perfilService.getPerfil(id).subscribe({
      next: (data: any) => {
        this.form.patchValue(data);
      },
    });
  }

  guardar() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Completa los campos requeridos', 'warning');
      return;
    }

    this.perfilService.createPerfil(this.form.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Colaborador registrado', 'success');
        this.form.reset();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar', 'error');
      },
    });
  }
}
