import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historicos } from './historicos';

describe('Historicos', () => {
  let component: Historicos;
  let fixture: ComponentFixture<Historicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historicos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
