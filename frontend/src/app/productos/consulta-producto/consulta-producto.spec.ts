import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaProducto } from './consulta-producto';

describe('ConsultaProducto', () => {
  let component: ConsultaProducto;
  let fixture: ComponentFixture<ConsultaProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
