import { Component, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, startWith, switchMap } from 'rxjs';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export const nonBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && !control.value.trim() ? { required: true } : null;
export const integer: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value != null && !Number.isInteger(control.value) ? { integer: true } : null;
@Component({
  selector: 'app-field-error',
  template: `@if (state()?.touched && state()?.errors) {
    <small class="field-error" role="alert">{{ message() }}</small>
  }`,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  // AbstractControl es mutable: sus eventos deben notificar al renderizado zoneless.
  readonly state = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) =>
        control.events.pipe(
          startWith(null),
          map(() => ({ touched: control.touched, errors: control.errors })),
        ),
      ),
    ),
  );
  message() {
    const c = this.control();
    if (c.hasError('required')) return 'Completá este campo.';
    if (c.hasError('maxlength'))
      return 'Usá hasta ' + c.getError('maxlength').requiredLength + ' caracteres.';
    if (c.hasError('email')) return 'Ingresá un correo válido.';
    if (c.hasError('min') || c.hasError('max') || c.hasError('integer'))
      return 'Ingresá un número entero entre 1 y 100.';
    return 'Revisá el formato indicado para este campo.';
  }
}
