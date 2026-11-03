import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROUTE_COMMANDS } from '../../app.route.segments';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.user()) {
    return true;
  }
  return router.createUrlTree(ROUTE_COMMANDS.login, { queryParams: { returnUrl: state.url } });
};

export function safeReturnUrl(value: string | null): string {
  return value &&
    /^\/(inicio|aulas|materias|usuarios|perfil|profesores|comisiones|reservas|avisos|clases)([?#].*)?$/.test(
      value,
    )
    ? value
    : '/inicio';
}
