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
