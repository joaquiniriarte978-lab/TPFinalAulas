import { Routes } from '@angular/router';
import ComisionList from './features/comision-list/comision-list';

const comisionRoutes: Routes = [
  {
    path: '',
    title: 'Comisiones · AulaSys',
    component: ComisionList,
  },
];

export default comisionRoutes;
