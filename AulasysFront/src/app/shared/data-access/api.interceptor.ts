import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';

// Patrón Chain of Responsibility: cada interceptor recibe la request, la modifica
// (agrega el header Authorization) y se la pasa al siguiente con next().
export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const authorization = auth.authorization();

  if (authorization && !request.headers.has('Authorization')) {
    request = request.clone({ setHeaders: { Authorization: authorization } });
  }

  return next(request).pipe(
    catchError((error) => {
      // Si el servidor dice 401 con una sesión iniciada, la sesión ya no sirve.
      if (error.status === 401 && authorization) {
        auth.logout('Tu sesión expiró. Iniciá sesión nuevamente.');
      }
      return throwError(() => error);
    }),
  );
};
