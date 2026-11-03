import { Routes } from '@angular/router';

const authRoutes: Routes = [
  {
    path: '',
    title: 'Ingresar · AulaSys',
    loadComponent: () => import('./features/login/login'),
  },
];

export default authRoutes;
