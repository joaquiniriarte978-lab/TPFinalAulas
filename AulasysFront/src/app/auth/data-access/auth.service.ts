import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Usuario } from '../../usuarios/data-access/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly currentUser = signal<Usuario | null>(null);
  private credentials: string | null = null;
  readonly user = this.currentUser.asReadonly();
  readonly isAdmin = computed(() => this.user()?.rol === 'ADMIN');
  readonly notice = signal('');
  get authorization(): string | null {
    return this.credentials;
  }

  login(username: string, password: string) {
    // HTTP Basic del backend. Sólo se conserva en memoria; nunca en Web Storage.
    const bytes = new TextEncoder().encode(`${username.trim()}:${password}`);
    const authorization = `Basic ${btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))}`;
    return this.http
      .get<Usuario>('/api/usuarios/me', {
        headers: new HttpHeaders({ Authorization: authorization }),
      })
      .pipe(
        tap((user) => {
          if (!['ADMIN', 'PROFESOR', 'ALUMNO'].includes(user.rol)) {
            throw new Error('La cuenta no tiene un rol habilitado. Consultá al administrador.');
          }
          this.credentials = authorization;
          this.currentUser.set(user);
          this.notice.set('');
        }),
      );
  }
  updateCurrentUser(user: Usuario) {
    if (user.id != null && user.id === this.user()?.id) this.currentUser.set(user);
  }
  logout(message = '') {
    this.credentials = null;
    this.currentUser.set(null);
    this.notice.set(message);
    void this.router.navigateByUrl('/login');
  }
}
