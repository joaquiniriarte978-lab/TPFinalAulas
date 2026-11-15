import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../data-access/auth.service';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export default class Login {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly error = signal('');
  protected readonly formModel = signal({ username: '', password: '' });

  protected readonly loginForm = form(
    this.formModel,
    (path) => {
      required(path.username, { message: 'Completá este campo.' });
      required(path.password, { message: 'Completá este campo.' });
    },
    {
      submission: {
        action: async () => {
          this.error.set('');
          const { username, password } = this.formModel();
          this.auth.login(username, password).subscribe({
            next: () => {
              this.router.navigate(ROUTE_COMMANDS.aulas);
            },
            error: (err) => this.error.set(mensajeError(err)),
          });
        },
      },
    },
  );
}
