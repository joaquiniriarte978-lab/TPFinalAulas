import { Component, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  disabled,
  email,
  form,
  FormField,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { UsuarioClient } from '../../data-access/usuario-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { normalize } from '../../../shared/utils/text';
import { Rol, ROLES, Usuario } from '../../data-access/usuario';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormsModule, FormField, Modal, FieldError],
  selector: 'app-usuario-list',
  styleUrl: './usuario-list.css',
  templateUrl: './usuario-list.html',
})
export default class UsuarioList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(UsuarioClient);

  protected readonly data = collection(() => this.client.getAllUsuarios());
  protected readonly state = crudState<Usuario>(this.data.load);
  protected readonly roles = ROLES;
  protected readonly roleKeys: Rol[] = ['ADMIN', 'PROFESOR', 'ALUMNO'];
  protected readonly query = signal('');
  protected readonly rol = signal('');
  protected readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (u) =>
          normalize(`${u.nombre} ${u.email}`).includes(normalize(this.query())) &&
          (!this.rol() || u.rol === this.rol()),
      ),
  );
  protected readonly formModel = signal({ nombre: '', email: '', password: '', rol: 'ALUMNO' as Rol });
  protected readonly form = form(this.formModel, (path) => {
    validate(path.nombre, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    maxLength(path.nombre, 20);
    required(path.email);
    email(path.email);
    pattern(path.email, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/);
    required(path.password, { when: () => !this.state.editing() });
    pattern(path.password, /^$|^(?=.*[A-Z]).{8,}$/);
    required(path.rol);
    disabled(path.rol, () => this.isSelf(this.state.editing()));
  });

  isSelf(user: Usuario | null) {
    return user?.id != null && user.id === this.auth.user()?.id;
  }

  clear() {
    this.query.set('');
    this.rol.set('');
  }

  open(user: Usuario | null = null) {
    this.form().reset(
      user
        ? { nombre: user.nombre, email: user.email, password: '', rol: user.rol }
        : { nombre: '', email: '', password: '', rol: 'ALUMNO' },
    );
    this.state.open(user);
  }

  save() {
    this.form().markAsTouched();
    if (this.form().invalid() || !this.auth.isAdmin()) return;
    const value = this.formModel();
    const current = this.state.editing();
    const payload = {
      nombre: value.nombre.trim(),
      email: value.email.trim(),
      rol: value.rol,
      ...(value.password ? { password: value.password } : {}),
    };
    const reauthenticate =
      this.isSelf(current) && (payload.email !== this.auth.user()?.email || !!value.password);
    const id = current?.id ?? undefined;
    this.state.run(
      (id == null ? this.client.addUsuario(payload) : this.client.editUsuario(payload, id)).pipe(
        tap((user) => this.auth.updateCurrentUser(user)),
      ),
      current ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
      reauthenticate
        ? () => this.auth.logout('Actualizaste tus credenciales. Ingresá con los nuevos datos.')
        : undefined,
    );
  }

  remove() {
    const user = this.state.deleting();
    if (user?.id != null && !this.isSelf(user) && this.auth.isAdmin())
      this.state.run(this.client.deleteUsuario(user.id), 'Usuario eliminado correctamente.');
  }
}
