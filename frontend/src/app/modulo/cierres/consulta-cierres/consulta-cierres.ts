import { Component, OnInit } from '@angular/core';
import { CierresService } from '../../services/cierres.services';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-cierres',
  imports: [CommonModule],
  templateUrl: './consulta-cierres.html',
  styleUrl: './consulta-cierres.scss',
})
export class ConsultaCierres implements OnInit {
  cierres: any[] = [];

  constructor(private service: CierresService) {}

  ngOnInit(): void {
    this.cargarCierres();
  }

  cargarCierres() {
    this.service.getCierres().subscribe((data: any) => {
      this.cierres = data;
    });
  }
}
