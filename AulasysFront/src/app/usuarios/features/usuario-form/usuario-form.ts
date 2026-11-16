import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  disabled,
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
import { Rol, ROLES, Usuario } from '../../data-access/usuario';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-usuario-form',
  styleUrl: './usuario-form.css',
  templateUrl: './usuario-form.html',
})
export default class UsuarioForm implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(UsuarioClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly editingUser = signal<Usuario | null>(null);
  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly roles = ROLES;

  protected readonly isSelf = computed(
    () => this.editingUser()?.id != null && this.editingUser()?.id === this.auth.user()?.id,
  );

  protected readonly formRoleKeys = computed<Rol[]>(() =>
    this.editingUser()?.rol === 'ADMIN' ? ['ADMIN'] : ['PROFESOR', 'ALUMNO'],
  );

  protected readonly formModel = signal({
    nombre: '',
    email: '',
    password: '',
    rol: 'ALUMNO' as Rol,
  });

  protected readonly usuarioForm = form(
    this.formModel,
    (path) => {
      validate(path.nombre, ({ value }) =>
        value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
      );
      maxLength(path.nombre, 20, { message: 'Máximo 20 caracteres.' });
      required(path.email, { message: 'Completá este campo.' });
      email(path.email, { message: 'Ingresá un correo electrónico válido.' });
      pattern(path.email, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
        message: 'Ingresá un correo electrónico válido.',
      });
      required(path.password, {
        message: 'Completá este campo.',
        when: () => !this.id,
      });
      pattern(path.password, /^$|^(?=.*[A-Z]).{8,}$/, {
        message: 'Usá al menos 8 caracteres y una mayúscula.',
      });
      required(path.rol, { message: 'Completá este campo.' });
      validate(path.rol, ({ value }) =>
        value() === 'ADMIN' && this.editingUser()?.rol !== 'ADMIN'
          ? { kind: 'adminNoPermitido', message: 'No se pueden crear ni asignar administradores.' }
          : undefined,
      );
      disabled(path.rol, () => this.isSelf());
    },
    {
      submission: {
        action: async () => {
          this.error.set('');
          const current = this.editingUser();
          if (current?.rol === 'ADMIN' && !this.isSelf()) return;
          if (this.submitting()) return;
          this.submitting.set(true);

          const value = this.formModel();
          const payload = {
            nombre: value.nombre.trim(),
            email: value.email.trim(),
            rol: value.rol,
            ...(value.password ? { password: value.password } : {}),
          };

          const reauthenticate =
            this.isSelf() && (payload.email !== this.auth.user()?.email || !!value.password);

          const request$ = this.id
            ? this.client.editUsuario(payload, this.id)
            : this.client.addUsuario(payload);

          request$.subscribe({
            next: (user) => {
              this.submitting.set(false);
              this.auth.updateCurrentUser(user);
              if (reauthenticate) {
                this.auth.logout('Actualizaste tus credenciales. Ingresá con los nuevos datos.');
              } else {
                this.notificationService.show(
                  this.id ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
                );
                this.router.navigate(ROUTE_COMMANDS.usuarios);
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

  ngOnInit() {
    if (this.id) {
      this.client.getUsuarioById(this.id).subscribe({
        next: (user) => {
          this.editingUser.set(user);
          this.formModel.set({
            nombre: user.nombre,
            email: user.email,
            password: '',
            rol: user.rol,
          });
        },
        error: (err) => this.error.set(mensajeError(err)),
      });
    }
  }

  cancelar() {
    this.router.navigate(ROUTE_COMMANDS.usuarios);
  }
}
