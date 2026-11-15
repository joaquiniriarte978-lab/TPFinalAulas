import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import ReservaList from './features/reserva-list/reserva-list';
import ReservaForm from './features/reserva-form/reserva-form';
import ReservaDetail from './features/reserva-detail/reserva-detail';

const reservaRoutes: Routes = [
  {
    path: '',
    title: 'Reservas · AulaSys',
    component: ReservaList,
  },
  {
    path: ROUTE_SEGMENTS.nuevo,
    title: 'Nueva reserva · AulaSys',
    component: ReservaForm,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Detalle de reserva · AulaSys',
    component: ReservaDetail,
  },
];

export default reservaRoutes;
