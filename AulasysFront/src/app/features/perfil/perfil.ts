import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { FieldError, nonBlank } from '../../shared/field-error';
import { crudState } from '../../shared/crud-state';
@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, FieldError],
  template: ` <div class="page-heading">
      <div>
        <h1>Mi perfil</h1>
        <p>Actualizá tus datos de acceso.</p>
      </div>
    </div>
    <section class="panel form-panel">
      @if (auth.user()?.id == null) {
        <p class="alert">
          Las cuentas de prueba no permiten editar el perfil. Usá una cuenta registrada.
        </p>
      }
      @if (state.error()) {
        <p class="alert" role="alert">{{ state.error() }}</p>
      }
      @if (state.success()) {
        <p class="success" role="status">{{ state.success() }}</p>
      }
      <form [formGroup]="form" (ngSubmit)="save()">
        <fieldset [disabled]="state.busy() || auth.user()?.id == null">
          <label>Nombre<input formControlName="nombre" maxlength="20" /></label
          ><app-field-error [control]="form.controls.nombre" />
          <label>Correo<input formControlName="email" type="email" /></label
          ><app-field-error [control]="form.controls.email" />
          <label
            >Nueva contraseña<input
              formControlName="password"
              type="password"
              autocomplete="new-password" /></label
          ><app-field-error [control]="form.controls.password" />
          <p class="muted">
            Dejala vacía para conservar la actual. Usá al menos 8 caracteres y una mayúscula.
          </p>
          <p>Rol: {{ auth.user()?.rol }}</p>
          <button class="button primary" type="submit">
            {{ state.busy() ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </fieldset>
      </form>
    </section>`,
})
export class Perfil {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly state = crudState<never>(() => {});
  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: [this.auth.user()?.nombre ?? '', [nonBlank, Validators.maxLength(20)]],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    password: ['', Validators.pattern(/^$|^(?=.*[A-Z]).{8,}$/)],
  });
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.auth.user()?.id == null) return;
    const v = this.form.getRawValue();
    const reauth = v.email.trim() !== this.auth.user()?.email || !!v.password;
    this.state.run(
      this.api
        .savePerfil({ ...v, nombre: v.nombre.trim(), email: v.email.trim() })
        .pipe(tap((u) => this.auth.updateCurrentUser(u))),
      'Perfil actualizado.',
      () => {
        this.form.controls.password.reset();
        if (reauth)
          this.auth.logout('Actualizaste tus credenciales. Ingresá con los nuevos datos.');
      },
    );
  }
}
