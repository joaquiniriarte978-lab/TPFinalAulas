import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Component({
  imports: [],
  selector: 'app-field-error',
  styleUrl: './field-error.css',
  templateUrl: './field-error.html',
})
export class FieldError {
  public readonly field = input.required<FieldTree<unknown>>();
}
