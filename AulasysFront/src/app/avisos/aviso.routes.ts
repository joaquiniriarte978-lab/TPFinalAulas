import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import AvisoList from './features/aviso-list/aviso-list';
import AvisoForm from './features/aviso-form/aviso-form';

const avisoRoutes: Routes = [
  {
    path: '',
    title: 'Avisos · AulaSys',
    component: AvisoList,
  },
  {
    path: ROUTE_SEGMENTS.nuevo,
    title: 'Nuevo aviso · AulaSys',
    component: AvisoForm,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Editar aviso · AulaSys',
    component: AvisoForm,
  },
];

export default avisoRoutes;
