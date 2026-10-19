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
export type Turno = 'MAÑANA' | 'TARDE' | 'NOCHE';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
export const TURNOS: Turno[] = ['MAÑANA', 'TARDE', 'NOCHE'];
export const DIAS: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
export interface Profesor {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  materiasIds: number[];
}
export interface ClaseFija {
  id: number;
  id_comision: number;
  id_aula: number;
  aulaNombre: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}
export type ClaseFijaInput = Omit<ClaseFija, 'id' | 'aulaNombre'>;
export interface ComisionInput {
  id_profesor: number;
  id_materia: number;
  cantAlumnos: number;
  horario: Turno;
  fechaInicio: string;
  fechaFin: string;
}
export interface Comision extends ComisionInput {
  id: number;
  profesorNombre: string;
  materiaNombre: string;
  claseFija: ClaseFija | null;
}
export interface ReservaInput {
  id_comision: number;
  id_aula: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  liberarClaseFija: boolean;
}
export interface Reserva extends Omit<ReservaInput, 'liberarClaseFija'> {
  id: number;
  aulaNombre: string;
  materiaNombre: string;
  profesorNombre: string;
  estadoReserva: 'RESERVADA' | 'FINALIZADA';
  propia: boolean;
  editable: boolean;
}
export interface AvisoInput {
  id_aula: number;
  mensaje: string;
}
export interface Aviso {
  id: number;
  idAula: number;
  idUsuario: number;
  aulaNombre: string;
  autorNombre: string;
  propio: boolean;
  mensaje: string;
  fecha: string;
  estado: string;
}
export interface Clase {
  comisionId: number;
  materiaId: number;
  materiaNombre: string;
  profesorNombre: string;
  aulaId: number;
  aulaNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  origen: 'CLASE_FIJA' | 'RESERVA';
}
export type PerfilInput = Pick<UsuarioInput, 'nombre' | 'email' | 'password'>;
export function fechaHoy(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
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
