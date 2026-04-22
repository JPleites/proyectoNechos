import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vendedor } from './vendedor';

describe('Vendedor', () => {
  let component: Vendedor;
  let fixture: ComponentFixture<Vendedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vendedor],
    }).compileComponents();

    fixture = TestBed.createComponent(Vendedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
