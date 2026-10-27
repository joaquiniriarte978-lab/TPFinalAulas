import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ROLES } from '../core/models';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  readonly auth = inject(AuthService);
  readonly roles = ROLES;
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly sectionTitle = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    const titles: Record<string, string> = {
      '/perfil': 'Mi perfil',
      '/profesores': 'Profesores y materias',
      '/comisiones': 'Comisiones',
      '/reservas': 'Reservas',
      '/avisos': 'Avisos',
      '/clases': 'Clases',
    };
    if (titles[path]) return titles[path];
    return path === '/aulas'
      ? 'Aulas'
      : path === '/materias'
        ? 'Materias'
        : path === '/usuarios'
          ? 'Usuarios'
          : 'Gestión de Aulas';
  });
}
