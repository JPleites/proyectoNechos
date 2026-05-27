import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaMarcas } from './consulta-marcas';

describe('ConsultaMarcas', () => {
  let component: ConsultaMarcas;
  let fixture: ComponentFixture<ConsultaMarcas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaMarcas],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaMarcas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
