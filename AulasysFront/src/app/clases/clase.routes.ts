import { Routes } from '@angular/router';
import ClaseList from './features/clase-list/clase-list';

const claseRoutes: Routes = [
  {
    path: '',
    title: 'Clases · AulaSys',
    component: ClaseList,
  },
];

export default claseRoutes;
