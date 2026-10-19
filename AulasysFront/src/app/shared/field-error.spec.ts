import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FieldError } from './field-error';

describe('Mensajes de validación reactivos', () => {
  it('actualiza el mensaje cuando cambia el estado del mismo control, sin reemplazarlo', async () => {
    const control = new FormControl('', [Validators.required, Validators.email]);
    const fixture = TestBed.createComponent(FieldError);
    fixture.componentRef.setInput('control', control);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
    control.markAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Completá este campo');
    control.setValue('correo-invalido');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('correo válido');
    control.setValue('ana@test.com');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
