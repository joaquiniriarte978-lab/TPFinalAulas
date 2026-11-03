import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Aula, AulaInput } from './aula';

@Service()
export class AulaClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/aulas';

  getAllAulas() {
    return this.http.get<Aula[]>(this.baseUrl);
  }

  addAula(newAula: AulaInput) {
    return this.http.post<Aula>(this.baseUrl, newAula);
  }

  editAula(edittedAula: AulaInput, id: number) {
    return this.http.put<Aula>(`${this.baseUrl}/${id}`, edittedAula);
  }

  deleteAula(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
