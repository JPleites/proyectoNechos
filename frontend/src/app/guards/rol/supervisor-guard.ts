import { CanActivateFn } from '@angular/router';

export const supervisorGuard: CanActivateFn = (route, state) => {
  const rol = localStorage.getItem('rol');

  if (rol !== 'supervisor') {
    window.location.href = '/login';
    return false;
  }

  return true;
};
