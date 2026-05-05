import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaUbicaciones } from './consulta-ubicaciones';

describe('ConsultaUbicaciones', () => {
  let component: ConsultaUbicaciones;
  let fixture: ComponentFixture<ConsultaUbicaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaUbicaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaUbicaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
