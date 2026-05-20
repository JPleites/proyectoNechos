import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPedidos } from './consulta-pedidos';

describe('ConsultaPedidos', () => {
  let component: ConsultaPedidos;
  let fixture: ComponentFixture<ConsultaPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaPedidos],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
