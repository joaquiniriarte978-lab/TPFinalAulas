import { Routes } from '@angular/router';
import ReservaList from './features/reserva-list/reserva-list';

const reservaRoutes: Routes = [
  {
    path: '',
    title: 'Reservas · AulaSys',
    component: ReservaList,
  },
];

export default reservaRoutes;
