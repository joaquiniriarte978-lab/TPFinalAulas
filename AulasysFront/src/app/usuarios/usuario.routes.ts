import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import UsuarioList from './features/usuario-list/usuario-list';
import UsuarioForm from './features/usuario-form/usuario-form';

const usuarioRoutes: Routes = [
  {
    path: '',
    title: 'Usuarios · AulaSys',
    component: UsuarioList,
  },
  {
    path: ROUTE_SEGMENTS.nuevo,
    title: 'Nuevo usuario · AulaSys',
    component: UsuarioForm,
  },
  {
    path: ROUTE_SEGMENTS.id,
    title: 'Editar usuario · AulaSys',
    component: UsuarioForm,
  },
];

export default usuarioRoutes;
