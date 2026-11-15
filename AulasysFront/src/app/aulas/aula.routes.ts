import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import { roleGuard } from '../auth/data-access/role-guard';
import AulaList from './features/aula-list/aula-list';
import AulaForm from './features/aula-form/aula-form';

const aulaRoutes: Routes = [
  {
    path: '',
    title: 'Aulas · AulaSys',
    component: AulaList,
  },
  {
    path: ROUTE_SEGMENTS.nuevo,
    title: 'Nueva aula · AulaSys',
    canActivate: [roleGuard('ADMIN')],
    component: AulaForm,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Editar aula · AulaSys',
    canActivate: [roleGuard('ADMIN')],
    component: AulaForm,
  },
];

export default aulaRoutes;
