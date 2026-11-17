import { Service, signal } from '@angular/core';

@Service()
export class ConfirmationService {
  private readonly confirmationRequestState = signal<string | null>(null);
  readonly confirmationRequest = this.confirmationRequestState.asReadonly();

  private readonly extraState = signal<string | null>(null);
  readonly extra = this.extraState.asReadonly();

  private resolveConfirmation: ((respuesta: boolean | 'extra') => void) | null = null;

  requestConfirmation(message: string, extra: string | null = null) {
    return new Promise<boolean | 'extra'>((resolve) => {
      this.resolveConfirmation = resolve;
      this.extraState.set(extra);
      this.confirmationRequestState.set(message);
    });
  }

  onConfirmationClosed(respuesta: boolean | 'extra') {
    const resolve = this.resolveConfirmation;
    if (!resolve) return;

    this.resolveConfirmation = null;
    this.confirmationRequestState.set(null);
    resolve(respuesta);
  }
}
