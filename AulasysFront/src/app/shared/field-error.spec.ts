import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { email, form, required } from '@angular/forms/signals';
import { FieldError } from './field-error';

describe('Mensajes de Signal Forms', () => {
  it('actualiza el mensaje cuando cambia el estado del mismo control, sin reemplazarlo', async () => {
    const model = signal({ email: '' });
    const formState = form(model, (path) => {
      required(path.email);
      email(path.email);
    });
    const fixture = TestBed.createComponent(FieldError);
    fixture.componentRef.setInput('field', formState.email);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
    formState.email().markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Completá este campo');
    model.set({ email: 'correo-invalido' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('correo válido');
    model.set({ email: 'ana@test.com' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
