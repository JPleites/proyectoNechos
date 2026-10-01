import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaDescuentos } from './consulta-descuentos';

describe('ConsultaDescuentos', () => {
  let component: ConsultaDescuentos;
  let fixture: ComponentFixture<ConsultaDescuentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaDescuentos],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaDescuentos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
