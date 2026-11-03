import { Routes } from '@angular/router';
import MateriaList from './features/materia-list/materia-list';

const materiaRoutes: Routes = [
  {
    path: '',
    title: 'Materias · AulaSys',
    component: MateriaList,
  },
];

export default materiaRoutes;
