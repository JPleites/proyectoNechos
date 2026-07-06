import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaInventario } from './consulta-inventario';

describe('ConsultaInventario', () => {
  let component: ConsultaInventario;
  let fixture: ComponentFixture<ConsultaInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
