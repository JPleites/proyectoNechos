import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { vendedorGuard } from './vendedor-guard';

describe('vendedorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => vendedorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
