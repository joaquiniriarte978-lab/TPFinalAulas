import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Profesor } from './profesor';

@Service()
export class ProfesorClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/profesores';

  getAllProfesores() {
    return this.http.get<Profesor[]>(this.baseUrl);
  }

  editMaterias(materiasIds: number[], id: number) {
    return this.http.put<Profesor>(`${this.baseUrl}/${id}/materias`, { materiasIds });
  }
}
