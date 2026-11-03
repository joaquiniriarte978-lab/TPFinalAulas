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

  addReserva(newReserva: ReservaInput) {
    return this.http.post<Reserva>(this.baseUrl, newReserva);
  }

  editReserva(edittedReserva: ReservaInput, id: number) {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}`, edittedReserva);
  }

  cancelReserva(id: number) {
    return this.http.put<void>(`${this.baseUrl}/cancelar/${id}`, {});
  }

  deleteReserva(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
