import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { FieldError } from '../../shared/field-error';
import { crudState } from '../../shared/crud-state';
@Component({
  selector: 'app-perfil',
  imports: [FormField, FieldError],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly state = crudState<never>(() => {});
  readonly formModel = signal({
    nombre: this.auth.user()?.nombre ?? '',
    email: this.auth.user()?.email ?? '',
    password: '',
  });
  readonly form = form(this.formModel, (path) => {
    validate(path.nombre, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    maxLength(path.nombre, 20);
    required(path.email);
    email(path.email);
    pattern(path.password, /^$|^(?=.*[A-Z]).{8,}$/);
  });
  save() {
    this.form().markAsTouched();
    if (this.form().invalid() || this.auth.user()?.id == null) return;
    const v = this.formModel();
    const reauth = v.email.trim() !== this.auth.user()?.email || !!v.password;
    this.state.run(
      this.api
        .savePerfil({ ...v, nombre: v.nombre.trim(), email: v.email.trim() })
        .pipe(tap((u) => this.auth.updateCurrentUser(u))),
      'Perfil actualizado.',
      () => {
        this.form.password().reset('');
        if (reauth)
          this.auth.logout('Actualizaste tus credenciales. Ingresá con los nuevos datos.');
      },
    );
  }
}
