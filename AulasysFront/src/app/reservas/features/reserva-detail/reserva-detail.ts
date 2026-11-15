import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaClient } from '../../data-access/reserva-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Reserva } from '../../data-access/reserva';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';
import ReservaForm from '../reserva-form/reserva-form';

@Component({
  imports: [ReservaForm],
  selector: 'app-reserva-detail',
  styleUrl: './reserva-detail.css',
  templateUrl: './reserva-detail.html',
})
export default class ReservaDetail implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ReservaClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly reserva = signal<Reserva | null>(null);
  protected readonly editing = signal(false);
  protected readonly error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    if (!this.id) return;
    this.error.set('');
    this.client.getReservaById(this.id).subscribe({
      next: (r) => this.reserva.set(r),
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  onSaved() {
    this.editing.set(false);
    this.load();
  }

  async cancelarOEliminar(r: Reserva) {
    const esFinalizada = r.estadoReserva === 'FINALIZADA';
    const confirmed = await this.confirmationService.requestConfirmation(
      esFinalizada
        ? `¿Seguro que deseás eliminar del historial la reserva de ${r.materiaNombre} (${r.fecha})?`
        : `¿Seguro que deseás cancelar la reserva de ${r.materiaNombre} en ${r.aulaNombre} (${r.fecha})?`,
    );
    if (!confirmed) return;

    const request$ = esFinalizada
      ? this.client.deleteReserva(r.id)
      : this.client.cancelReserva(r.id);

    request$.subscribe({
      next: () => {
        this.notificationService.show(esFinalizada ? 'Reserva eliminada.' : 'Reserva cancelada.');
        this.router.navigate(ROUTE_COMMANDS.reservas);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  volver() {
    this.router.navigate(ROUTE_COMMANDS.reservas);
  }
}
