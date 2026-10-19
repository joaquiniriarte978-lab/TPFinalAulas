import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';

/** Impide envíos duplicados y mantiene abierto el formulario cuando falla la API. */
export function crudState<T>(reload: () => void) {
  const destroyRef = inject(DestroyRef);
  const editing = signal<T | null>(null);
  const deleting = signal<T | null>(null);
  const opened = signal(false);
  const busy = signal(false);
  const error = signal('');
  const success = signal('');
  const close = () => {
    if (!busy()) {
      opened.set(false);
      deleting.set(null);
      error.set('');
    }
  };
  const open = (item: T | null) => {
    editing.set(item);
    error.set('');
    success.set('');
    opened.set(true);
  };
  const confirmDelete = (item: T) => {
    deleting.set(item);
    error.set('');
    success.set('');
  };
  const run = (request: Observable<unknown>, message: string, after?: () => void) => {
    if (busy()) return;
    busy.set(true);
    error.set('');
    success.set('');
    request
      .pipe(
        takeUntilDestroyed(destroyRef),
        finalize(() => busy.set(false)),
      )
      .subscribe({
        next: () => {
          opened.set(false);
          deleting.set(null);
          success.set(message);
          if (after) after();
          else reload();
        },
        error: (err: Error) => error.set(err.message),
      });
  };
  return { editing, deleting, opened, busy, error, success, close, open, confirmDelete, run };
}
