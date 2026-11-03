import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Clase } from './clase';

@Service()
export class ClaseClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/clases';

  getClases(fecha: string, materiaId = '', aulaId = '') {
    return this.http.get<Clase[]>(this.baseUrl, {
      params: { fecha, ...(materiaId ? { materiaId } : {}), ...(aulaId ? { aulaId } : {}) },
    });
  }
}
