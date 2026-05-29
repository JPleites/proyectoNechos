import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarCaja } from './cerrar-caja';

describe('CerrarCaja', () => {
  let component: CerrarCaja;
  let fixture: ComponentFixture<CerrarCaja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CerrarCaja],
    }).compileComponents();

    fixture = TestBed.createComponent(CerrarCaja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
