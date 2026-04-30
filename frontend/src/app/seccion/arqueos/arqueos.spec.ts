import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Arqueos } from './arqueos';

describe('Arqueos', () => {
  let component: Arqueos;
  let fixture: ComponentFixture<Arqueos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Arqueos],
    }).compileComponents();

    fixture = TestBed.createComponent(Arqueos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
