import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import ProfesorList from './features/profesor-list/profesor-list';
import ProfesorForm from './features/profesor-form/profesor-form';


const profesorRoutes: Routes = [
  {
    path: '',
    title: 'Profesores · AulaSys',
    component: ProfesorList,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Asignar materias · AulaSys',
    component: ProfesorForm,
  },
];

export default profesorRoutes;
