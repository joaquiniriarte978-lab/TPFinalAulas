import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Usuario } from '../../usuarios/data-access/usuario';
import { ROUTE_COMMANDS } from '../../app.route.segments';


@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUser = signal<Usuario | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isAdmin = computed(() => this.user()?.rol === 'ADMIN');

  private readonly credentials = signal<string | null>(null);
  readonly authorization = this.credentials.asReadonly();

  readonly notice = signal('');

  login(username: string, password: string) {
    const authorization = `Basic ${btoa(`${username.trim()}:${password}`)}`;
    return this.http
      .get<Usuario>('/api/usuarios/me', {
        headers: new HttpHeaders({ Authorization: authorization }),
      })
      .pipe(
        tap((user) => {
          this.credentials.set(authorization);
          this.currentUser.set(user);
          this.notice.set('');
        }),
      );
  }

  updateCurrentUser(user: Usuario) {
    if (user.id === this.user()?.id) this.currentUser.set(user);
  }

  logout(message = '') {
    this.credentials.set(null);
    this.currentUser.set(null);
    this.notice.set(message);
    this.router.navigate(ROUTE_COMMANDS.login);
  }
}
