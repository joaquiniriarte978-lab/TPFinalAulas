import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Aviso, AvisoInput, EstadoAviso } from './aviso';
import { Aula } from '../../aulas/data-access/aula';

@Service()
export class AvisoClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/avisos';

  getAllAvisos() {
    return this.http.get<Aviso[]>(this.baseUrl);
  }

  getAvisoById(id: number | string) {
    return this.http.get<Aviso>(`${this.baseUrl}/${id}`);
  }

  getAulasHabilitadas() {
    return this.http.get<Aula[]>(`${this.baseUrl}/aulas-habilitadas`);
  }

  addAviso(newAviso: AvisoInput) {
    return this.http.post<Aviso>(this.baseUrl, newAviso);
  }

  editAviso(edittedAviso: AvisoInput, id: number | string) {
    return this.http.put<Aviso>(`${this.baseUrl}/${id}`, edittedAviso);
  }

  cambiarEstado(id: number | string, estado: EstadoAviso) {
    return this.http.put<Aviso>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  deleteAviso(id: number | string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
