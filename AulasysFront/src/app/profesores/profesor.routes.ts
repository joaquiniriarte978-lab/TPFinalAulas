import { Routes } from '@angular/router';
import ProfesorList from './features/profesor-list/profesor-list';

const profesorRoutes: Routes = [
  {
    path: '',
    title: 'Profesores · AulaSys',
    component: ProfesorList,
  },
];

export default profesorRoutes;
