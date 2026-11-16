import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { ReservaClient } from '../../data-access/reserva-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { ComisionClient } from '../../../comisiones/data-access/comision-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Reserva } from '../../data-access/reserva';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-reserva-form',
  styleUrl: './reserva-form.css',
  templateUrl: './reserva-form.html',
})
export default class ReservaForm {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ReservaClient);
  private readonly aulaClient = inject(AulaClient);
  private readonly comisionClient = inject(ComisionClient);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  readonly editingReserva = input<Reserva>();
  readonly saved = output<Reserva>();
  readonly cancelled = output<void>();

  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly aulas = toSignal(this.aulaClient.getAllAulas(), { initialValue: [] });
  protected readonly comisiones = toSignal(
    this.auth.isAdmin()
      ? this.comisionClient.getAllComisiones()
      : this.comisionClient.getMisComisiones(),
    { initialValue: [] },
  );

  protected readonly formModel = linkedSignal(() => {
    const r = this.editingReserva();
    return r
      ? {
          id_comision: String(r.id_comision),
          id_aula: String(r.id_aula),
          fecha: r.fecha,
          horaInicio: r.horaInicio.slice(0, 5),
          horaFin: r.horaFin.slice(0, 5),
        }
      : {
          id_comision: '',
          id_aula: '',
          fecha: new Date().toLocaleDateString('en-CA'),
          horaInicio: '',
          horaFin: '',
        };
  });

  protected readonly reservaForm = form(
    this.formModel,
    (path) => {
      validate(path.id_comision, ({ value }) =>
        Number(value()) > 0 ? undefined : { kind: 'required', message: 'Seleccioná una comisión.' },
      );
      validate(path.id_aula, ({ value }) =>
        Number(value()) > 0 ? undefined : { kind: 'required', message: 'Seleccioná un aula.' },
      );
      required(path.fecha, { message: 'Completá este campo.' });
      required(path.horaInicio, { message: 'Completá este campo.' });
      required(path.horaFin, { message: 'Completá este campo.' });
    },
    {
      submission: {
        action: async () => {
          this.enviar(false);
        },
      },
    },
  );

  enviar(liberar: boolean) {
    if (this.submitting()) return;
    this.error.set('');
    const raw = this.formModel();
    if (raw.horaFin <= raw.horaInicio) {
      this.error.set('La hora de fin debe ser posterior al inicio.');
      return;
    }

    this.submitting.set(true);
    const payload = {
      ...raw,
      id_comision: Number(raw.id_comision),
      id_aula: Number(raw.id_aula),
      liberarClaseFija: liberar,
    };

    const current = this.editingReserva();
    const request$ = current
      ? this.client.editReserva(payload, current.id)
      : this.client.addReserva(payload);

    request$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.notificationService.show('Reserva guardada.');
        if (current) {
          this.saved.emit(res);
        } else {
          this.router.navigate(ROUTE_COMMANDS.reservas);
        }
      },
      error: async (err) => {
        this.submitting.set(false);
        const msg = mensajeError(err);
        if (msg.startsWith('CONFIRMACION_LIBERAR_AULA:')) {
          const texto = msg.slice('CONFIRMACION_LIBERAR_AULA:'.length).trim();
          const confirmed = await this.confirmationService.requestConfirmation(texto);
          if (confirmed) {
            this.enviar(true);
          }
        } else {
          this.error.set(msg);
        }
      },
    });
  }

  cancelar() {
    if (this.editingReserva()) {
      this.cancelled.emit();
    } else {
      this.router.navigate(ROUTE_COMMANDS.reservas);
    }
  }
}
