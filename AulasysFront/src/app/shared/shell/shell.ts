import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth.service';
import { ROLES } from '../../usuarios/data-access/usuario';
import { ROUTE_COMMANDS } from '../../app.route.segments';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly commands = ROUTE_COMMANDS;
  protected readonly roles = ROLES;
  protected readonly menuOpen = signal(false);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly sectionTitle = computed(() => {
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
