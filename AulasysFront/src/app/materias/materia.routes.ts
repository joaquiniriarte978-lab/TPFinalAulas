import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import { roleGuard } from '../auth/data-access/role-guard';
import MateriaList from './features/materia-list/materia-list';
import MateriaForm from './features/materia-form/materia-form';

const materiaRoutes: Routes = [
  {
    path: '',
    title: 'Materias · AulaSys',
    component: MateriaList,
  },
  {
    path: ROUTE_SEGMENTS.nuevo,
    title: 'Nueva materia · AulaSys',
    canActivate: [roleGuard('ADMIN')],
    component: MateriaForm,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Editar materia · AulaSys',
    canActivate: [roleGuard('ADMIN')],
    component: MateriaForm,
  },
];

export default materiaRoutes;
