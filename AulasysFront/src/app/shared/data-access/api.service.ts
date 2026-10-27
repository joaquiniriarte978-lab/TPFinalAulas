import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Aula, AulaInput } from '../../aulas/data-access/aula.model';
import { Materia, MateriaInput } from '../../materias/data-access/materia.model';
import { Usuario, UsuarioInput } from '../../usuarios/data-access/usuario.model';
import { Profesor } from '../../profesores/data-access/profesor.model';
import {
  Comision,
  ComisionInput,
  ClaseFija,
  ClaseFijaInput,
} from '../../comisiones/data-access/comision.model';
import { Reserva, ReservaInput } from '../../reservas/data-access/reserva.model';
import { Aviso, AvisoInput } from '../../avisos/data-access/aviso.model';
import { Clase } from '../../clases/data-access/clase.model';
import { PerfilInput } from '../../usuarios/data-access/usuario.model';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  perfil = () => this.http.get<Usuario>('/api/usuarios/me');
  savePerfil = (value: PerfilInput) => this.http.put<Usuario>('/api/usuarios/me', value);
  profesores = () => this.http.get<Profesor[]>('/api/profesores');
  asignarMaterias = (id: number, materiasIds: number[]) =>
    this.http.put<Profesor>(`/api/profesores/${id}/materias`, { materiasIds });
  comisiones = () => this.http.get<Comision[]>('/api/comision');
  misComisiones = () => this.http.get<Comision[]>('/api/comision/mis-comisiones');
  saveComision = (value: ComisionInput, id?: number) =>
    id == null
      ? this.http.post<Comision>('/api/comision', value)
      : this.http.put<Comision>(`/api/comision/${id}`, value);
  deleteComision = (id: number) => this.http.delete<void>(`/api/comision/${id}`);
  saveClaseFija = (value: ClaseFijaInput) => this.http.post<ClaseFija>('/api/clase-fija', value);
  deleteClaseFija = (id: number) => this.http.delete<void>(`/api/clase-fija/comision/${id}`);
  reservas = () => this.http.get<Reserva[]>('/api/reservas');
  saveReserva = (value: ReservaInput, id?: number) =>
    id == null
      ? this.http.post<Reserva>('/api/reservas', value)
      : this.http.put<Reserva>(`/api/reservas/${id}`, value);
  cancelarReserva = (id: number) => this.http.put<void>(`/api/reservas/cancelar/${id}`, {});
  deleteReserva = (id: number) => this.http.delete<void>(`/api/reservas/${id}`);
  avisos = () => this.http.get<Aviso[]>('/api/avisos');
  aulasAvisos = () => this.http.get<Aula[]>('/api/avisos/aulas-habilitadas');
  saveAviso = (value: AvisoInput, id?: number) =>
    id == null
      ? this.http.post<Aviso>('/api/avisos', value)
      : this.http.put<Aviso>(`/api/avisos/${id}`, value);
  clases = (fecha: string, materiaId = '', aulaId = '') =>
    this.http.get<Clase[]>('/api/clases', {
      params: { fecha, ...(materiaId ? { materiaId } : {}), ...(aulaId ? { aulaId } : {}) },
    });
  aulas = () => this.http.get<Aula[]>('/api/aulas');
  saveAula = (value: AulaInput, id?: number) =>
    id == null
      ? this.http.post<Aula>('/api/aulas', value)
      : this.http.put<Aula>(`/api/aulas/${id}`, value);
  deleteAula = (id: number) => this.http.delete<void>(`/api/aulas/${id}`);
  materias = () => this.http.get<Materia[]>('/api/materias');
  saveMateria = (value: MateriaInput, id?: number) =>
    id == null
      ? this.http.post<Materia>('/api/materias', value)
      : this.http.put<Materia>(`/api/materias/${id}`, value);
  deleteMateria = (id: number) => this.http.delete<void>(`/api/materias/${id}`);
  usuarios = () => this.http.get<Usuario[]>('/api/usuarios');
  // No enviar materiasIds: editar una cuenta debe conservar sus asignaciones académicas.
  saveUsuario = (value: UsuarioInput, id?: number) =>
    id == null
      ? this.http.post<Usuario>('/api/usuarios', value)
      : this.http.put<Usuario>(`/api/usuarios/${id}`, value);
  deleteUsuario = (id: number) => this.http.delete<void>(`/api/usuarios/${id}`);
}
