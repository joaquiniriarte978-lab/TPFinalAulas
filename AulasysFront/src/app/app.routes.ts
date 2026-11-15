import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './app.route.segments';
import { authGuard } from './auth/data-access/auth-guard';
import { guestGuard } from './auth/data-access/guest-guard';
import { roleGuard } from './auth/data-access/role-guard';
import { Shell } from './shared/shell/shell';

export const appRoutes: Routes = [
  {
    path: ROUTE_SEGMENTS.login,
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ROUTE_SEGMENTS.aulas,
      },
      {
        path: ROUTE_SEGMENTS.inicio,
        pathMatch: 'full',
        redirectTo: ROUTE_SEGMENTS.aulas,
      },
      {
        path: ROUTE_SEGMENTS.perfil,
        loadComponent: () => import('./usuarios/features/perfil/perfil'),
      },
      {
        path: ROUTE_SEGMENTS.profesores,
        canActivate: [roleGuard('ADMIN')],
        loadChildren: () => import('./profesores/profesor.routes'),
      },
      {
        path: ROUTE_SEGMENTS.comisiones,
        canActivate: [roleGuard('ADMIN', 'PROFESOR')],
        loadChildren: () => import('./comisiones/comision.routes'),
      },
      {
        path: ROUTE_SEGMENTS.reservas,
        canActivate: [roleGuard('ADMIN', 'PROFESOR')],
        loadChildren: () => import('./reservas/reserva.routes'),
      },
      {
        path: ROUTE_SEGMENTS.avisos,
        canActivate: [roleGuard('ADMIN', 'PROFESOR')],
        loadChildren: () => import('./avisos/aviso.routes'),
      },
      {
        path: ROUTE_SEGMENTS.clases,
        loadChildren: () => import('./clases/clase.routes'),
      },
      {
        path: ROUTE_SEGMENTS.aulas,
        loadChildren: () => import('./aulas/aula.routes'),
      },
      {
        path: ROUTE_SEGMENTS.materias,
        loadChildren: () => import('./materias/materia.routes'),
      },
      {
        path: ROUTE_SEGMENTS.usuarios,
        canActivate: [roleGuard('ADMIN')],
        loadChildren: () => import('./usuarios/usuario.routes'),
      },
      {
        path: ROUTE_SEGMENTS.accessDenied,
        loadComponent: () => import('./errors/features/access-denied/access-denied'),
      },
      {
        path: '**',
        loadComponent: () => import('./errors/features/not-found/not-found'),
      },
    ],
  },
];
