import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';
@Component({
  selector: 'app-modal',
  template: `<dialog #dialog aria-labelledby="dialog-title" (cancel)="cancel($event)">
    <div class="dialog-heading">
      <div>
        <h2 id="dialog-title">{{ title() }}</h2>
      </div>
      <button
        type="button"
        class="icon-button"
        aria-label="Cerrar ventana"
        [disabled]="busy()"
        (click)="closed.emit()"
      >
        ×
      </button>
    </div>
    <ng-content />
  </dialog>`,
})
export class Modal implements AfterViewInit {
  readonly title = input.required<string>();
  readonly busy = input(false);
  readonly closed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  ngAfterViewInit() {
    this.dialog().nativeElement.showModal();
  }
  cancel(event: Event) {
    event.preventDefault();
    if (!this.busy()) this.closed.emit();
  }
}
