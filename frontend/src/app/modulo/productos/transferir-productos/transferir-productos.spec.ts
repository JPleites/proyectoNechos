import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferirProductos } from './transferir-productos';

describe('TransferirProductos', () => {
  let component: TransferirProductos;
  let fixture: ComponentFixture<TransferirProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferirProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferirProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
