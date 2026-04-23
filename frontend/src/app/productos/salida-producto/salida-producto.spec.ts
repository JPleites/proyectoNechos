import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidaProducto } from './salida-producto';

describe('SalidaProducto', () => {
  let component: SalidaProducto;
  let fixture: ComponentFixture<SalidaProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalidaProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(SalidaProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
