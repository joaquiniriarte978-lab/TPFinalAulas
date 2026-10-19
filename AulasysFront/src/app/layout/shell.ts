import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ROLES } from '../core/models';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <a class="skip-link" href="#contenido" (click)="$event.preventDefault(); content.focus()"
      >Saltar al contenido</a
    >
    <div class="app-layout">
      <aside class="sidebar" [class.open]="menuOpen()">
        <div class="sidebar-logo"><a routerLink="/aulas">AulasSys</a><small>v1.0.0</small></div>
        <div class="sidebar-user">
          <span class="user-avatar">{{ auth.user()?.nombre?.charAt(0)?.toUpperCase() }}</span>
          <div>
            <strong>{{ auth.user()?.nombre }}</strong
            ><small>{{ roles[auth.user()!.rol] }}</small>
          </div>
        </div>
        <nav class="sidebar-nav" aria-label="Navegación principal" (click)="menuOpen.set(false)">
          <div class="nav-section-label">Principal</div>
          <a
            class="nav-item"
            routerLink="/clases"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            >Clases</a
          >
          <a
            class="nav-item"
            routerLink="/perfil"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            >Mi perfil</a
          >
          @if (auth.user()?.rol !== 'ALUMNO') {
            <a
              class="nav-item"
              routerLink="/comisiones"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >{{ auth.isAdmin() ? 'Comisiones' : 'Mis comisiones' }}</a
            >
            <a
              class="nav-item"
              routerLink="/reservas"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >Reservas</a
            >
            <a
              class="nav-item"
              routerLink="/avisos"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >Avisos</a
            >
          }
          <a
            class="nav-item"
            routerLink="/aulas"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            >Aulas</a
          >
          <a
            class="nav-item"
            routerLink="/materias"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            >Materias</a
          >
          @if (auth.isAdmin()) {
            <div class="nav-section-label">Gestión</div>
            <a
              class="nav-item"
              routerLink="/profesores"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >Profesores y materias</a
            >
            <a
              class="nav-item"
              routerLink="/usuarios"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >Usuarios</a
            >
          }
        </nav>
        <div class="sidebar-footer">
          <button class="button secondary" (click)="auth.logout()">Cerrar sesión</button>
        </div>
      </aside>
      @if (menuOpen()) {
        <button
          class="sidebar-overlay"
          aria-label="Cerrar menú"
          (click)="menuOpen.set(false)"
        ></button>
      }
      <div class="workspace">
        <header class="topbar">
          <button
            class="hamburger"
            aria-label="Abrir menú"
            [attr.aria-expanded]="menuOpen()"
            (click)="menuOpen.set(!menuOpen())"
          >
            ☰
          </button>
          <strong>{{ sectionTitle() }}</strong>
        </header>
        <main #content id="contenido" tabindex="-1"><router-outlet /></main>
      </div>
    </div>
  `,
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
