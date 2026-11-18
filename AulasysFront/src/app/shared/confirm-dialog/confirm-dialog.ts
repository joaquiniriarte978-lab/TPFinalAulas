import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  imports: [],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly closed = output<boolean | 'extra'>();
  readonly extra = input<string | null>(null);  readonly message = input.required<string>();
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  private readonly previousFocus = document.activeElement as HTMLElement | null;

  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.previousFocus?.isConnected) this.previousFocus.focus();
    });
  }

  protected cancel(event: Event) {
    event.preventDefault();
    this.closed.emit(false);
  }
}
