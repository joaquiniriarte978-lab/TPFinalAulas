export type TipoAula = 'AULA' | 'LABORATORIO' | 'SUM' | 'LABORATORIO_TEXTIL' | 'LABORATORIO_IDIOMAS';

export interface Aula {
  id: number;
  nombre: string;
  capacidad: number;
  tipo: TipoAula;
  equipamiento: string | null;
}

export type AulaInput = Omit<Aula, 'id'>;

export const TIPOS_AULA: { value: TipoAula; label: string }[] = [
  { value: 'AULA', label: 'Aula' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
  { value: 'SUM', label: 'Salón de usos múltiples' },
  { value: 'LABORATORIO_TEXTIL', label: 'Laboratorio textil' },
  { value: 'LABORATORIO_IDIOMAS', label: 'Laboratorio de idiomas' },
];
