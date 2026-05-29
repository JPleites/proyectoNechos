import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(private service: CierresService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarCierres();
  }

  cargarCierres() {
    this.service.getCierres().subscribe((data: any) => {
      this.cierres = data;
      console.log('Cierres cargados:', this.cierres);
      this.cdRef.detectChanges();
    });
  }
}
