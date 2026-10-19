export type Rol = 'ADMIN' | 'PROFESOR' | 'ALUMNO';
export type TipoAula =
  'AULA' | 'LABORATORIO' | 'SUM' | 'LABORATORIO_TEXTIL' | 'LABORATORIO_IDIOMAS';
export interface Aula {
  id: number;
  nombre: string;
  capacidad: number;
  tipo: TipoAula;
  equipamiento: string | null;
}
export type AulaInput = Omit<Aula, 'id'>;
export interface Materia {
  id: number;
  nombre: string;
  requiereLaboratorio: boolean;
}
export type MateriaInput = Omit<Materia, 'id'>;
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
export const ROLES: Record<Rol, string> = {
  ADMIN: 'Administrador',
  PROFESOR: 'Profesor',
  ALUMNO: 'Alumno',
};
export const TIPOS_AULA: { value: TipoAula; label: string }[] = [
  { value: 'AULA', label: 'Aula' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
  { value: 'SUM', label: 'Salón de usos múltiples' },
  { value: 'LABORATORIO_TEXTIL', label: 'Laboratorio textil' },
  { value: 'LABORATORIO_IDIOMAS', label: 'Laboratorio de idiomas' },
];
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
