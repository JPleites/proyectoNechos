import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPerfil } from './lista-perfil';

describe('ListaPerfil', () => {
  let component: ListaPerfil;
  let fixture: ComponentFixture<ListaPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
