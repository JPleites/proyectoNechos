import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAlmacen } from './crear-almacen';

describe('CrearAlmacen', () => {
  let component: CrearAlmacen;
  let fixture: ComponentFixture<CrearAlmacen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAlmacen],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearAlmacen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
