import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearUbicacion } from './crear-ubicacion';

describe('CrearUbicacion', () => {
  let component: CrearUbicacion;
  let fixture: ComponentFixture<CrearUbicacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearUbicacion],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearUbicacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
