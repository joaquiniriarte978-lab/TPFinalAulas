import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).user()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
export const adminGuard: CanActivateFn = () =>
  inject(AuthService).isAdmin() ? true : inject(Router).createUrlTree(['/sin-acceso']);
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).user() ? inject(Router).createUrlTree(['/inicio']) : true;
export const staffGuard: CanActivateFn = () =>
  ['ADMIN', 'PROFESOR'].includes(inject(AuthService).user()?.rol ?? '')
    ? true
    : inject(Router).createUrlTree(['/sin-acceso']);
export function safeReturnUrl(value: string | null): string {
  return value &&
    /^\/(inicio|aulas|materias|usuarios|perfil|profesores|comisiones|reservas|avisos|clases)([?#].*)?$/.test(
      value,
    )
    ? value
    : '/inicio';
}
