export type Turno = 'MAÑANA' | 'TARDE' | 'NOCHE';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
export const TURNOS: Turno[] = ['MAÑANA', 'TARDE', 'NOCHE'];
export const DIAS: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
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
