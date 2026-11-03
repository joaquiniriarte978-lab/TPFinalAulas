import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './app.route.segments';
import { authGuard } from './auth/data-access/auth-guard';
import { adminGuard } from './auth/data-access/admin-guard';
import { guestGuard } from './auth/data-access/guest-guard';
import { staffGuard } from './auth/data-access/staff-guard';
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
    canActivateChild: [authGuard],
    children: [
      {
        path: ROUTE_SEGMENTS.perfil,
        title: 'Mi perfil · AulaSys',
        loadComponent: () => import('./usuarios/features/perfil/perfil'),
      },
      {
        path: ROUTE_SEGMENTS.profesores,
        canActivate: [adminGuard],
        loadChildren: () => import('./profesores/profesor.routes'),
      },
      {
        path: ROUTE_SEGMENTS.comisiones,
        canActivate: [staffGuard],
        loadChildren: () => import('./comisiones/comision.routes'),
      },
      {
        path: ROUTE_SEGMENTS.reservas,
        canActivate: [staffGuard],
        loadChildren: () => import('./reservas/reserva.routes'),
      },
      {
        path: ROUTE_SEGMENTS.avisos,
        canActivate: [staffGuard],
        loadChildren: () => import('./avisos/aviso.routes'),
      },
      {
        path: ROUTE_SEGMENTS.clases,
        loadChildren: () => import('./clases/clase.routes'),
      },
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
        path: ROUTE_SEGMENTS.aulas,
        loadChildren: () => import('./aulas/aula.routes'),
      },
      {
        path: ROUTE_SEGMENTS.materias,
        loadChildren: () => import('./materias/materia.routes'),
      },
      {
        path: ROUTE_SEGMENTS.usuarios,
        canActivate: [adminGuard],
        loadChildren: () => import('./usuarios/usuario.routes'),
      },
      {
        path: ROUTE_SEGMENTS.accessDenied,
        title: 'Acceso restringido · AulaSys',
        loadComponent: () => import('./errors/features/access-denied/access-denied'),
      },
      {
        path: '**',
        title: 'Página no encontrada · AulaSys',
        loadComponent: () => import('./errors/features/not-found/not-found'),
      },
    ],
  },
];
