import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
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
