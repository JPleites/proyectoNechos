import { CanActivateFn } from '@angular/router';

export const cajeroGuard: CanActivateFn = (route, state) => {
  const rol = localStorage.getItem('rol');

  if (rol !== 'cajero') {
    window.location.href = '/login';
    return false;
  }

  return true;
};
