import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ROUTE_COMMANDS } from '../../app.route.segments';
import { Rol } from '../../usuarios/data-access/usuario';

// Patrón Factory Method: roleGuard() fabrica un guard distinto según los roles permitidos.
// Ej: roleGuard('ADMIN') o roleGuard('ADMIN', 'PROFESOR').
export function roleGuard(...roles: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();
    if (user && roles.includes(user.rol)) {
      return true;
    }
    return router.createUrlTree(ROUTE_COMMANDS.accessDenied);
  };
}
