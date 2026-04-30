import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cierres } from './cierres';

describe('Cierres', () => {
  let component: Cierres;
  let fixture: ComponentFixture<Cierres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cierres],
    }).compileComponents();

    fixture = TestBed.createComponent(Cierres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
