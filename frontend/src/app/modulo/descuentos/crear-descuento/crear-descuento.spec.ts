import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDescuento } from './crear-descuento';

describe('CrearDescuento', () => {
  let component: CrearDescuento;
  let fixture: ComponentFixture<CrearDescuento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearDescuento],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearDescuento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
