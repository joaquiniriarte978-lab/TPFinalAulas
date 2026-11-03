import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROUTE_COMMANDS } from '../../app.route.segments';

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (['ADMIN', 'PROFESOR'].includes(auth.user()?.rol ?? '')) {
    return true;
  }
  return router.createUrlTree(ROUTE_COMMANDS.accessDenied);
};
