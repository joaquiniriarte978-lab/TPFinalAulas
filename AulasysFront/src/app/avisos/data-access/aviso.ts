export type EstadoAviso = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';

export const ESTADOS: Record<EstadoAviso, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  RESUELTO: 'Resuelto',
};

export const ESTADO_KEYS: EstadoAviso[] = ['PENDIENTE', 'EN_REVISION', 'RESUELTO'];

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
  fechaActualizacion: string | null;
  estado: EstadoAviso;
}
