export type Rol = 'ADMIN' | 'PROFESOR' | 'ALUMNO';
export interface Usuario {
  id: number | null;
  nombre: string;
  email: string;
  rol: Rol;
  materiasIds: number[] | null;
}
export interface UsuarioInput {
  nombre: string;
  email: string;
  password?: string;
  rol: Rol;
}
export type PerfilInput = Pick<UsuarioInput, 'nombre' | 'email' | 'password'>;
export const ROLES: Record<Rol, string> = {
  ADMIN: 'Administrador',
  PROFESOR: 'Profesor',
  ALUMNO: 'Alumno',
};
