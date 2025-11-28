import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  // TODO: Implementar lógica real de admin
  // Por ahora permitimos acceso para demostración
  return true;
};
