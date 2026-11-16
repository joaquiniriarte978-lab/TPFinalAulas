import { Service, signal } from '@angular/core';

// Tiempo suficiente para leer el mensaje; también se puede cerrar con el botón.
const NOTIFICATION_DURATION_MS = 8000;

@Service()
export class NotificationService {
  private readonly currentNotificationState = signal<string | null>(null);
  readonly current = this.currentNotificationState.asReadonly();
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  show(message: string) {
    clearTimeout(this.timeoutId);
    this.currentNotificationState.set(message);
    this.timeoutId = setTimeout(() => this.dismiss(), NOTIFICATION_DURATION_MS);
  }

  dismiss() {
    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
    this.currentNotificationState.set(null);
  }
}
