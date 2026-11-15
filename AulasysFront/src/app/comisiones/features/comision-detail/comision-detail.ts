import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComisionClient } from '../../data-access/comision-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Comision } from '../../data-access/comision';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';
import ComisionForm from '../comision-form/comision-form';
import ClaseFijaForm from '../clase-fija-form/clase-fija-form';

@Component({
  imports: [ComisionForm, ClaseFijaForm],
  selector: 'app-comision-detail',
  styleUrl: './comision-detail.css',
  templateUrl: './comision-detail.html',
})
export default class ComisionDetail implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ComisionClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly comision = signal<Comision | null>(null);
  protected readonly mode = signal<'view' | 'edit' | 'clase'>('view');
  protected readonly error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    if (!this.id) return;
    this.error.set('');
    this.client.getComisionById(this.id).subscribe({
      next: (c) => this.comision.set(c),
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  onSaved() {
    this.mode.set('view');
    this.load();
  }

  async quitarClaseFija(c: Comision) {
    const confirmed = await this.confirmationService.requestConfirmation(
      `¿Seguro que deseás quitar la clase fija de la comisión #${c.id}?`,
    );
    if (!confirmed) return;

    this.client.deleteClaseFija(c.id).subscribe({
      next: () => {
        this.notificationService.show('Clase fija quitada.');
        this.load();
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  async eliminarComision(c: Comision) {
    const confirmed = await this.confirmationService.requestConfirmation(
      `¿Seguro que deseás eliminar la comisión #${c.id} de ${c.materiaNombre}?`,
    );
    if (!confirmed) return;

    this.client.deleteComision(c.id).subscribe({
      next: () => {
        this.notificationService.show('Comisión eliminada.');
        this.router.navigate(ROUTE_COMMANDS.comisiones);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  volver() {
    this.router.navigate(ROUTE_COMMANDS.comisiones);
  }
}
