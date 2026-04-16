import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nuevoproducto } from './nuevoproducto';

describe('Nuevoproducto', () => {
  let component: Nuevoproducto;
  let fixture: ComponentFixture<Nuevoproducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nuevoproducto],
    }).compileComponents();

    fixture = TestBed.createComponent(Nuevoproducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
