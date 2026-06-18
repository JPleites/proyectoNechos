import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSubcategorias } from './crear-subcategorias';

describe('CrearSubcategorias', () => {
  let component: CrearSubcategorias;
  let fixture: ComponentFixture<CrearSubcategorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSubcategorias],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearSubcategorias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
