import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
export function collection<T>(fetch: () => Observable<T[]>) {
  const destroyRef = inject(DestroyRef);
  const items = signal<T[]>([]);
  const loading = signal(false);
  const error = signal('');
  const load = () => {
    if (loading()) return;
    loading.set(true);
    error.set('');
    fetch()
      .pipe(
        takeUntilDestroyed(destroyRef),
        finalize(() => loading.set(false)),
      )
      .subscribe({
        next: (result) => items.set(result),
        error: (err: Error) => error.set(err.message),
      });
  };
  load();
  return { items, loading, error, load };
}
