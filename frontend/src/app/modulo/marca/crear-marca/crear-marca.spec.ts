import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearMarca } from './crear-marca';

describe('CrearMarca', () => {
  let component: CrearMarca;
  let fixture: ComponentFixture<CrearMarca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMarca],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearMarca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
