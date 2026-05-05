import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAlmacen } from './consulta-almacen';

describe('ConsultaAlmacen', () => {
  let component: ConsultaAlmacen;
  let fixture: ComponentFixture<ConsultaAlmacen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaAlmacen],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaAlmacen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
