import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Reserva, ReservaInput } from './reserva';

@Service()
export class ReservaClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reservas';

  getAllReservas() {
    return this.http.get<Reserva[]>(this.baseUrl);
  }

  getReservaById(id: number | string) {
    return this.http.get<Reserva>(`${this.baseUrl}/${id}`);
  }

  addReserva(newReserva: ReservaInput) {
    return this.http.post<Reserva>(this.baseUrl, newReserva);
  }

  editReserva(edittedReserva: ReservaInput, id: number | string) {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}`, edittedReserva);
  }

  cancelReserva(id: number | string) {
    return this.http.put<void>(`${this.baseUrl}/cancelar/${id}`, {});
  }

  deleteReserva(id: number | string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
