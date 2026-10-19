import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { safeReturnUrl } from '../../core/auth.guards';
import { FieldError, nonBlank } from '../../shared/field-error';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FieldError],
  template: ` <main class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <h1>Gestión de Aulas</h1>
        <p>Ingresá tus credenciales para continuar</p>
      </div>
      @if (auth.notice()) {
        <div class="notice" role="status">{{ auth.notice() }}</div>
      }
      @if (error()) {
        <div class="alert" role="alert">{{ error() }}</div>
      }
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="username">Email o usuario</label>
        <input
          id="username"
          formControlName="username"
          autocomplete="username"
          placeholder="ejemplo@correo.com"
          autofocus
        />
        <app-field-error [control]="form.controls.username" />
        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          autocomplete="current-password"
          placeholder="••••••••"
        />
        <app-field-error [control]="form.controls.password" />
        <button class="button primary login-submit" type="submit" [disabled]="busy()">
          {{ busy() ? 'Verificando acceso…' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  </main>`,
})
export class Login {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, nonBlank]],
    password: ['', Validators.required],
  });
  readonly error = signal('');
  readonly busy = signal(false);
  submit() {
    if (this.busy()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.busy.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth
      .login(username, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => {
          this.form.controls.password.reset();
          void this.router.navigateByUrl(
            safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
          );
        },
        error: (err: Error) => this.error.set(err.message),
      });
  }
}
