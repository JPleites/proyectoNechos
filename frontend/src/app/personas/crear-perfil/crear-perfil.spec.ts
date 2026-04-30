import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPerfil } from './crear-perfil';

describe('CrearPerfil', () => {
  let component: CrearPerfil;
  let fixture: ComponentFixture<CrearPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
