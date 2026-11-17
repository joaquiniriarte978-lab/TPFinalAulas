import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ClaseFija, ClaseFijaInput, Comision, ComisionInput } from './comision';

@Service()
export class ComisionClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/comision';
  private readonly claseFijaUrl = '/api/clase-fija';

  getAllComisiones() {
    return this.http.get<Comision[]>(this.baseUrl);
  }

  getMisComisiones() {
    return this.http.get<Comision[]>(`${this.baseUrl}/mis-comisiones`);
  }

  getComisionById(id: number | string) {
    return this.http.get<Comision>(`${this.baseUrl}/${id}`);
  }

  addComision(newComision: ComisionInput) {
    return this.http.post<Comision>(this.baseUrl, newComision);
  }

  editComision(edittedComision: ComisionInput, id: number | string) {
    return this.http.put<Comision>(`${this.baseUrl}/${id}`, edittedComision);
  }

  deleteComision(id: number | string, forzar = false) {
    return this.http.delete<void>(`${this.baseUrl}/${id}?forzar=${forzar}`);
  }

  addClaseFija(newClaseFija: ClaseFijaInput) {
    return this.http.post<ClaseFija>(this.claseFijaUrl, newClaseFija);
  }

  deleteClaseFija(id: number | string) {
    return this.http.delete<void>(`${this.claseFijaUrl}/comision/${id}`);
  }
}
