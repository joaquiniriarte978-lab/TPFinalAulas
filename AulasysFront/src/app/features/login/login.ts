import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormField, form, required, validate } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { safeReturnUrl } from '../../core/auth.guards';
import { FieldError } from '../../shared/field-error';
@Component({
  selector: 'app-login',
  imports: [FormField, FieldError],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly formModel = signal({ username: '', password: '' });
  readonly form = form(this.formModel, (path) => {
    validate(path.username, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    required(path.password);
  });
  readonly error = signal('');
  readonly busy = signal(false);
  submit() {
    if (this.busy()) return;
    this.form().markAsTouched();
    if (this.form().invalid()) return;
    this.busy.set(true);
    this.error.set('');
    const { username, password } = this.formModel();
    this.auth
      .login(username, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => {
          this.form.password().reset('');
          void this.router.navigateByUrl(
            safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
          );
        },
        error: (err: Error) => this.error.set(err.message),
      });
  }
}
