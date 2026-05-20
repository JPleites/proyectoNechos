import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaCierres } from './consulta-cierres';

describe('ConsultaCierres', () => {
  let component: ConsultaCierres;
  let fixture: ComponentFixture<ConsultaCierres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaCierres],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaCierres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
