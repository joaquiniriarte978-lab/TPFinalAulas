import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { ROLES } from '../../usuarios/data-access/usuario';
import { ROUTE_COMMANDS } from '../../app.route.segments';

const MOBILE_QUERY = '(max-width: 768px)';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
  host: { '(document:keydown.escape)': 'cerrarMenu()' },
})
export class Shell {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly commands = ROUTE_COMMANDS;
  protected readonly roles = ROLES;
  protected readonly menuOpen = signal(false);

  private readonly mediaQuery = window.matchMedia?.(MOBILE_QUERY);
  protected readonly isMobile = signal(this.mediaQuery?.matches ?? false);

  private readonly hamburger = viewChild.required<ElementRef<HTMLButtonElement>>('hamburger');
  private readonly nav = viewChild.required<ElementRef<HTMLElement>>('nav');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Al pasar a escritorio el menú vuelve a estar siempre visible.
    const onMediaChange = (event: MediaQueryListEvent) => {
      this.isMobile.set(event.matches);
      if (!event.matches) this.menuOpen.set(false);
    };
    this.mediaQuery?.addEventListener('change', onMediaChange);
    destroyRef.onDestroy(() => this.mediaQuery?.removeEventListener('change', onMediaChange));

    // En una SPA el foco no se mueve solo: tras navegar lo llevamos al contenido.
    const subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.content().nativeElement.focus({ preventScroll: true });
      }
    });
    destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  protected irAlContenido(event: Event) {
    event.preventDefault();
    this.content().nativeElement.focus();
  }

  protected toggleMenu() {
    if (this.menuOpen()) {
      this.cerrarMenu();
      return;
    }
    this.menuOpen.set(true);
    // Espera a que el menú deje de ser inerte antes de enfocar su primer enlace.
    setTimeout(() => this.nav().nativeElement.querySelector<HTMLElement>('a')?.focus());
  }

  protected cerrarMenu() {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (this.isMobile()) this.hamburger().nativeElement.focus();
  }
}
