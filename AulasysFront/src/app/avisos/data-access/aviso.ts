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
