import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal implements AfterViewInit {
  public readonly title = input.required<string>();
  public readonly busy = input(false);
  public readonly closed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  ngAfterViewInit() {
    this.dialog().nativeElement.showModal();
  }

  cancel(event: Event) {
    event.preventDefault();
    if (!this.busy()) this.closed.emit();
  }
}
