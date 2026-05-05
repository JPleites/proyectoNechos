import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealizarArqueo } from './realizar-arqueo';

describe('RealizarArqueo', () => {
  let component: RealizarArqueo;
  let fixture: ComponentFixture<RealizarArqueo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizarArqueo],
    }).compileComponents();

    fixture = TestBed.createComponent(RealizarArqueo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
