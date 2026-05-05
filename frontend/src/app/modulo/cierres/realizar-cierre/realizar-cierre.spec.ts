import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealizarCierre } from './realizar-cierre';

describe('RealizarCierre', () => {
  let component: RealizarCierre;
  let fixture: ComponentFixture<RealizarCierre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizarCierre],
    }).compileComponents();

    fixture = TestBed.createComponent(RealizarCierre);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
