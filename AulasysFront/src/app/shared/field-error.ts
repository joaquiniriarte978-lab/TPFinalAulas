import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.html',
  styleUrl: './field-error.css',
})
export class FieldError {
  readonly field = input.required<FieldTree<unknown>>();
  readonly state = computed(() => this.field()());
  readonly visible = computed(() => this.state().touched() && this.state().errors().length > 0);
  readonly message = computed(() => {
    const error = this.state().errors()[0];
    if (!error) return '';
    if (error.message) return error.message;
    switch (error.kind) {
      case 'required':
        return 'Completá este campo.';
      case 'maxLength':
        return 'El valor supera la longitud permitida.';
      case 'email':
        return 'Ingresá un correo válido.';
      case 'min':
      case 'max':
      case 'integer':
        return 'Ingresá un número entero entre 1 y 100.';
      default:
        return 'Revisá el formato indicado para este campo.';
    }
  });
}
