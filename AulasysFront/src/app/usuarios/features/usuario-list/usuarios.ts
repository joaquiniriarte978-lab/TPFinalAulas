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
<<<<<<< HEAD
<<<<<<< Updated upstream:AulasysFront/src/app/usuarios/features/usuario-list/usuarios.ts
=======
>>>>>>> c3dc27cbe825a3c1a1207d9c2ddf84e74d732be1
import { ApiService } from '../../../shared/data-access/api.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { normalize } from '../../../shared/utils/text';
import { Rol, ROLES, Usuario } from '../../data-access/usuario.model';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import FieldError from '../../../shared/ui/field-error/field-error';
import Modal from '../../../shared/ui/modal/modal';
<<<<<<< HEAD
=======
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { normalize, Rol, ROLES, Usuario } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError } from '../../shared/field-error';
import { Modal } from '../../shared/modal';
>>>>>>> Stashed changes:AulasysFront/src/app/features/usuarios/usuarios.ts
=======
>>>>>>> c3dc27cbe825a3c1a1207d9c2ddf84e74d732be1
@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, FormField, Modal, FieldError],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export default class Usuarios {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.usuarios);
  readonly state = crudState<Usuario>(this.data.load);
  readonly roles = ROLES;
  readonly roleKeys: Rol[] = ['ADMIN', 'PROFESOR', 'ALUMNO'];
  readonly query = signal('');
  readonly rol = signal('');
  readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (u) =>
          normalize(`${u.nombre} ${u.email}`).includes(normalize(this.query())) &&
          (!this.rol() || u.rol === this.rol()),
      ),
  );
  readonly formModel = signal({ nombre: '', email: '', password: '', rol: 'ALUMNO' as Rol });
  readonly form = form(this.formModel, (path) => {
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
    this.state.run(
      this.api
        .saveUsuario(payload, current?.id ?? undefined)
        .pipe(tap((user) => this.auth.updateCurrentUser(user))),
      current ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
      reauthenticate
        ? () => this.auth.logout('Actualizaste tus credenciales. Ingresá con los nuevos datos.')
        : undefined,
    );
  }
  remove() {
    const user = this.state.deleting();
    if (user?.id != null && !this.isSelf(user) && this.auth.isAdmin())
      this.state.run(this.api.deleteUsuario(user.id), 'Usuario eliminado correctamente.');
  }
}
