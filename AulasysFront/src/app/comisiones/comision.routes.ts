import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import { roleGuard } from '../auth/data-access/role-guard';
import ComisionList from './features/comision-list/comision-list';
import ComisionForm from './features/comision-form/comision-form';
import ComisionDetail from './features/comision-detail/comision-detail';

const comisionRoutes: Routes = [
  {
    path: '',
    title: 'Comisiones · AulaSys',
    component: ComisionList,
  },
  {
    path: ROUTE_SEGMENTS.nuevo,
    title: 'Nueva comisión · AulaSys',
    canActivate: [roleGuard('ADMIN')],
    component: ComisionForm,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Detalle de comisión · AulaSys',
    component: ComisionDetail,
  },
];

export default comisionRoutes;
