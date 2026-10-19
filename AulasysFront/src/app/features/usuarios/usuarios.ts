import { Component, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { normalize, Rol, ROLES, Usuario } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError, nonBlank } from '../../shared/field-error';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, ReactiveFormsModule, Modal, FieldError],
  templateUrl: './usuarios.html',
})
export class Usuarios {
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
  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [nonBlank, Validators.maxLength(20)]],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/),
      ],
    ],
    password: [''],
    rol: ['ALUMNO' as Rol, Validators.required],
  });
  isSelf(user: Usuario | null) {
    return user?.id != null && user.id === this.auth.user()?.id;
  }
  clear() {
    this.query.set('');
    this.rol.set('');
  }
  open(user: Usuario | null = null) {
    this.form.reset(
      user
        ? { nombre: user.nombre, email: user.email, password: '', rol: user.rol }
        : { nombre: '', email: '', password: '', rol: 'ALUMNO' },
    );
    this.form.controls.password.setValidators(
      user
        ? [Validators.pattern(/^$|^(?=.*[A-Z]).{8,}$/)]
        : [Validators.required, Validators.pattern(/^(?=.*[A-Z]).{8,}$/)],
    );
    this.form.controls.password.updateValueAndValidity();
    if (this.isSelf(user)) this.form.controls.rol.disable();
    else this.form.controls.rol.enable();
    this.state.open(user);
  }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.auth.isAdmin()) return;
    const value = this.form.getRawValue();
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
