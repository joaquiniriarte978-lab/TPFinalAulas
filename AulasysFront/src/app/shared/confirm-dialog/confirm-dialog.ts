import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly closed = output<boolean>();
  readonly message = input.required<string>();
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }
}
