import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Aula, AulaInput, Materia, MateriaInput, Usuario, UsuarioInput } from './models';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
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
