import { Routes } from '@angular/router';
import AulaList from './features/aula-list/aula-list';

const aulaRoutes: Routes = [
  {
    path: '',
    title: 'Aulas · AulaSys',
    component: AulaList,
  },
];

export default aulaRoutes;
