import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialCierres } from './historial-cierres';

describe('HistorialCierres', () => {
  let component: HistorialCierres;
  let fixture: ComponentFixture<HistorialCierres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialCierres],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialCierres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
