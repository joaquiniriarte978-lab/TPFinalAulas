import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Materia, MateriaInput } from './materia';

@Service()
export class MateriaClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/materias';

  getAllMaterias() {
    return this.http.get<Materia[]>(this.baseUrl);
  }

  getMateriaById(id: number | string) {
    return this.http.get<Materia>(`${this.baseUrl}/${id}`);
  }

  addMateria(newMateria: MateriaInput) {
    return this.http.post<Materia>(this.baseUrl, newMateria);
  }

  editMateria(edittedMateria: MateriaInput, id: number | string) {
    return this.http.put<Materia>(`${this.baseUrl}/${id}`, edittedMateria);
  }

  deleteMateria(id: number | string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
