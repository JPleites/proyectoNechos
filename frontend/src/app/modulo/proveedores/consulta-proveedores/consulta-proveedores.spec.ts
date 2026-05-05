import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaProveedores } from './consulta-proveedores';

describe('ConsultaProveedores', () => {
  let component: ConsultaProveedores;
  let fixture: ComponentFixture<ConsultaProveedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaProveedores],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaProveedores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
