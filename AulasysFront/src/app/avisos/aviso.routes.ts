import { Routes } from '@angular/router';
import AvisoList from './features/aviso-list/aviso-list';

const avisoRoutes: Routes = [
  {
    path: '',
    title: 'Avisos · AulaSys',
    component: AvisoList,
  },
];

export default avisoRoutes;
