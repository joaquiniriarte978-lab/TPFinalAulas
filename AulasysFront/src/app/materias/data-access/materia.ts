export interface Materia {
  id: number;
  nombre: string;
  requiereLaboratorio: boolean;
}
export type MateriaInput = Omit<Materia, 'id'>;
