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
import { UsuarioClient } from '../../data-access/usuario-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { FieldError } from '../../../shared/field-error/field-error';
import { crudState } from '../../../shared/utils/crud-state';

@Component({
  imports: [FormField, FieldError],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export default class Perfil {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(UsuarioClient);

  protected readonly state = crudState<never>(() => {});
  protected readonly formModel = signal({
    nombre: this.auth.user()?.nombre ?? '',
    email: this.auth.user()?.email ?? '',
    password: '',
  });
  protected readonly form = form(this.formModel, (path) => {
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
      this.client
        .editPerfil({ ...v, nombre: v.nombre.trim(), email: v.email.trim() })
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
