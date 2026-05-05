import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaClientes } from './consulta-clientes';

describe('ConsultaClientes', () => {
  let component: ConsultaClientes;
  let fixture: ComponentFixture<ConsultaClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaClientes],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaClientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
