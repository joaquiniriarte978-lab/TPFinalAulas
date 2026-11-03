import { Routes } from '@angular/router';
import UsuarioList from './features/usuario-list/usuario-list';

const usuarioRoutes: Routes = [
  {
    path: '',
    title: 'Usuarios · AulaSys',
    component: UsuarioList,
  },
];

export default usuarioRoutes;
