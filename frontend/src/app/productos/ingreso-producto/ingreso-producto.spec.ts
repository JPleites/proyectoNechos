import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoProducto } from './ingreso-producto';

describe('IngresoProducto', () => {
  let component: IngresoProducto;
  let fixture: ComponentFixture<IngresoProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
