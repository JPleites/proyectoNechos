import { CanActivateFn } from '@angular/router';

export const vendedorGuard: CanActivateFn = (route, state) => {
  const rol = localStorage.getItem('rol');

  if (rol !== 'vendedor') {
    window.location.href = '/login';
    return false;
  }

  return true;
};
