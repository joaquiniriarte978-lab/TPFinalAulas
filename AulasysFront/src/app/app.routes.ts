import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, staffGuard } from './core/auth.guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · AulaSys',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
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
        loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil),
      },
      {
        path: 'profesores',
        canActivate: [adminGuard],
        title: 'Profesores · AulaSys',
        loadComponent: () => import('./features/profesores/profesores').then((m) => m.Profesores),
      },
      {
        path: 'comisiones',
        canActivate: [staffGuard],
        title: 'Comisiones · AulaSys',
        loadComponent: () => import('./features/comisiones/comisiones').then((m) => m.Comisiones),
      },
      {
        path: 'reservas',
        canActivate: [staffGuard],
        title: 'Reservas · AulaSys',
        loadComponent: () => import('./features/reservas/reservas').then((m) => m.Reservas),
      },
      {
        path: 'avisos',
        canActivate: [staffGuard],
        title: 'Avisos · AulaSys',
        loadComponent: () => import('./features/avisos/avisos').then((m) => m.Avisos),
      },
      {
        path: 'clases',
        title: 'Clases · AulaSys',
        loadComponent: () => import('./features/clases/clases').then((m) => m.Clases),
      },
      { path: '', pathMatch: 'full', redirectTo: 'aulas' },
      { path: 'inicio', pathMatch: 'full', redirectTo: 'aulas' },
      {
        path: 'aulas',
        title: 'Aulas · AulaSys',
        loadComponent: () => import('./features/aulas/aulas').then((m) => m.Aulas),
      },
      {
        path: 'materias',
        title: 'Materias · AulaSys',
        loadComponent: () => import('./features/materias/materias').then((m) => m.Materias),
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        title: 'Usuarios · AulaSys',
        loadComponent: () => import('./features/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'sin-acceso',
        title: 'Acceso restringido · AulaSys',
        loadComponent: () => import('./features/home/access-denied').then((m) => m.AccessDenied),
      },
      {
        path: '**',
        title: 'Página no encontrada · AulaSys',
        loadComponent: () => import('./features/home/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
