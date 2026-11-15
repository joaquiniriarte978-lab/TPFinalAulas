import { HttpErrorResponse } from '@angular/common/http';

// El backend responde los errores como texto plano o como JSON { message }.
export function mensajeError(error: HttpErrorResponse): string {
  if (error.status === 0) return 'No se pudo conectar con el servidor.';
  if (typeof error.error === 'string' && error.error) return error.error;
  if (error.error?.message) return error.error.message;
  return 'Ocurrió un error. Intentá nuevamente.';
}
