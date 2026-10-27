import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
export function apiErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0 || [502, 503, 504].includes(error.status))
    return 'No pudimos conectar con el servidor. Verificá que el backend esté iniciado e intentá nuevamente.';
  if (error.status === 401) return 'El usuario o la contraseña no son correctos. Volvé a ingresar.';
  if (error.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';
  if (error.status === 404)
    return 'El registro ya no existe. Actualizá la lista e intentá nuevamente.';
  if (error.status >= 500)
    return 'El servidor no pudo completar la operación. Intentá nuevamente en unos momentos.';
  const body: unknown = error.error;
  const message =
    typeof body === 'string'
      ? body
      : body && typeof body === 'object' && 'message' in body
        ? body.message
        : null;
  if (
    typeof message === 'string' &&
    message.trim() &&
    message.length <= 500 &&
    !/<[^>]*>|SQL|jdbc|Exception|org\./i.test(message)
  )
    return message.replace(/^"|"$/g, '');
  if (error.status === 409)
    return 'No se puede completar la operación porque el registro tiene datos relacionados.';
  return 'No se pudieron guardar los cambios. Revisá los datos ingresados.';
}
export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) return next(request);
  const auth = inject(AuthService);
  const currentAuthorization = auth.authorization;
  if (currentAuthorization && !request.headers.has('Authorization'))
    request = request.clone({ setHeaders: { Authorization: currentAuthorization } });
  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      if (
        error.status === 401 &&
        currentAuthorization &&
        auth.authorization === currentAuthorization
      )
        auth.logout('Tu acceso dejó de ser válido. Iniciá sesión nuevamente.');
      return throwError(() => new Error(apiErrorMessage(error)));
    }),
  );
};
