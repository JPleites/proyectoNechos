import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const rol = localStorage.getItem('rol');

  if (rol !== 'admin') {
    window.location.href = '/login';
    return false;
  }

  return true;
};
