import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, staffGuard } from './auth/data-access/auth.guards';
import Shell from './shared/ui/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · AulaSys',
    loadComponent: () => import('./auth/features/login/login').then((m) => m.default),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'perfil',
        title: 'Mi perfil · AulaSys',
        loadComponent: () => import('./usuarios/features/perfil/perfil').then((m) => m.default),
      },
      {
        path: 'profesores',
        canActivate: [adminGuard],
        title: 'Profesores · AulaSys',
        loadComponent: () =>
          import('./profesores/features/profesor-list/profesores').then((m) => m.default),
      },
      {
        path: 'comisiones',
        canActivate: [staffGuard],
        title: 'Comisiones · AulaSys',
        loadComponent: () =>
          import('./comisiones/features/comision-list/comisiones').then((m) => m.default),
      },
      {
        path: 'reservas',
        canActivate: [staffGuard],
        title: 'Reservas · AulaSys',
        loadComponent: () =>
          import('./reservas/features/reserva-list/reservas').then((m) => m.default),
      },
      {
        path: 'avisos',
        canActivate: [staffGuard],
        title: 'Avisos · AulaSys',
        loadComponent: () => import('./avisos/features/aviso-list/avisos').then((m) => m.default),
      },
      {
        path: 'clases',
        title: 'Clases · AulaSys',
        loadComponent: () => import('./clases/features/clase-list/clases').then((m) => m.default),
      },
      { path: '', pathMatch: 'full', redirectTo: 'aulas' },
      { path: 'inicio', pathMatch: 'full', redirectTo: 'aulas' },
      {
        path: 'aulas',
        title: 'Aulas · AulaSys',
        loadComponent: () => import('./aulas/features/aula-list/aulas').then((m) => m.default),
      },
      {
        path: 'materias',
        title: 'Materias · AulaSys',
        loadComponent: () =>
          import('./materias/features/materia-list/materias').then((m) => m.default),
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        title: 'Usuarios · AulaSys',
        loadComponent: () =>
          import('./usuarios/features/usuario-list/usuarios').then((m) => m.default),
      },
      {
        path: 'sin-acceso',
        title: 'Acceso restringido · AulaSys',
        loadComponent: () => import('./home/features/access-denied').then((m) => m.default),
      },
      {
        path: '**',
        title: 'Página no encontrada · AulaSys',
        loadComponent: () => import('./home/features/not-found').then((m) => m.default),
      },
    ],
  },
];
