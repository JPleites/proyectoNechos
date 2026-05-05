import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaCategoria } from './consulta-categoria';

describe('ConsultaCategoria', () => {
  let component: ConsultaCategoria;
  let fixture: ComponentFixture<ConsultaCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
