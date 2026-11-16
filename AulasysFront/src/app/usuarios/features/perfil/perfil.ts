import { Component, inject, signal } from '@angular/core';
import {
  email,
  FormField,
  FormRoot,
  form,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { UsuarioClient } from '../../data-access/usuario-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export default class Perfil {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(UsuarioClient);
  private readonly notificationService = inject(NotificationService);

  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly formModel = signal({
    nombre: this.auth.user()?.nombre ?? '',
    email: this.auth.user()?.email ?? '',
    password: '',
  });

  protected readonly perfilForm = form(
    this.formModel,
    (path) => {
      validate(path.nombre, ({ value }) =>
        value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
      );
      maxLength(path.nombre, 20, { message: 'Máximo 20 caracteres.' });
      required(path.email, { message: 'Completá este campo.' });
      email(path.email, { message: 'Ingresá un correo electrónico válido.' });
      pattern(path.password, /^$|^(?=.*[A-Z]).{8,}$/, {
        message: 'Usá al menos 8 caracteres y una mayúscula.',
      });
    },
    {
      submission: {
        action: async () => {
          if (this.auth.user()?.id == null || this.submitting()) return;
          this.submitting.set(true);
          this.error.set('');
          const v = this.formModel();
          const reauth = v.email.trim() !== this.auth.user()?.email || !!v.password;

          this.client
            .editPerfil({ ...v, nombre: v.nombre.trim(), email: v.email.trim() })
            .subscribe({
              next: (u) => {
                this.submitting.set(false);
                this.auth.updateCurrentUser(u);
                this.perfilForm.password().reset('');
                if (reauth) {
                  this.auth.logout('Actualizaste tus credenciales. Ingresá con los nuevos datos.');
                } else {
                  this.notificationService.show('Perfil actualizado.');
                }
              },
              error: (err) => {
                this.submitting.set(false);
                this.error.set(mensajeError(err));
              },
            });
        },
      },
    },
  );
}
