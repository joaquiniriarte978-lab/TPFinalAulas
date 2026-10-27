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
