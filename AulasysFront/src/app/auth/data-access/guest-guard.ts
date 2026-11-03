import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROUTE_COMMANDS } from '../../app.route.segments';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.user()) {
    return router.createUrlTree(ROUTE_COMMANDS.inicio);
  }
  return true;
};
