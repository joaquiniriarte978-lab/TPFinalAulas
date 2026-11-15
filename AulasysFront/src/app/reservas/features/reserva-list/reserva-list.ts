import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReservaClient } from '../../data-access/reserva-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Reserva } from '../../data-access/reserva';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-reserva-list',
  styleUrl: './reserva-list.css',
  templateUrl: './reserva-list.html',
})
export default class ReservaList implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ReservaClient);
  private readonly router = inject(Router);

  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly query = signal('');
  protected readonly fecha = signal('');
  protected readonly scope = signal('');
  protected readonly history = signal('RESERVADA');

  protected readonly filtered = computed(() =>
    this.reservas().filter(
      (r) =>
        (!this.history() || r.estadoReserva === this.history()) &&
        (!this.scope() || r.propia) &&
        (!this.fecha() || r.fecha === this.fecha()) &&
        `${r.aulaNombre} ${r.materiaNombre} ${r.profesorNombre}`
          .toLowerCase()
          .includes(this.query().toLowerCase()),
    ),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.client.getAllReservas().subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  irANueva() {
    this.router.navigate(ROUTE_COMMANDS.nuevaReserva);
  }

  irADetalle(r: Reserva) {
    this.router.navigate(ROUTE_COMMANDS.detalleReserva(r.id));
  }
}
