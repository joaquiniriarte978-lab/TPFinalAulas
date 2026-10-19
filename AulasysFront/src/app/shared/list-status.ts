import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-list-status',
  template: `
    @if (loading()) {
      <p class="empty-state" role="status">Cargando…</p>
    } @else if (error()) {
      <div class="empty-state">
        <p class="alert" role="alert">{{ error() }}</p>
        <button class="button secondary" (click)="retry.emit()">Reintentar</button>
      </div>
    } @else if (!count()) {
      <p class="empty-state">No hay registros para mostrar.</p>
    }
  `,
})
export class ListStatus {
  readonly loading = input(false);
  readonly error = input('');
  readonly count = input(0);
  readonly retry = output<void>();
}
