import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormField, FormRoot, form, required, validate } from '@angular/forms/signals';
import { ComisionClient } from '../../data-access/comision-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { Comision, DIAS, DiaSemana } from '../../data-access/comision';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-clase-fija-form',
  styleUrl: './clase-fija-form.css',
  templateUrl: './clase-fija-form.html',
})
export default class ClaseFijaForm {
  private readonly client = inject(ComisionClient);
  private readonly aulaClient = inject(AulaClient);
  private readonly notificationService = inject(NotificationService);

  readonly comision = input.required<Comision>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly dias = DIAS;
  protected readonly error = signal('');
  protected readonly aulas = toSignal(this.aulaClient.getAllAulas(), { initialValue: [] });

  protected readonly claseModel = linkedSignal(() => {
    const f = this.comision().claseFija;
    return f
      ? {
          id_aula: String(f.id_aula),
          diaSemana: f.diaSemana,
          horaInicio: f.horaInicio.slice(0, 5),
          horaFin: f.horaFin.slice(0, 5),
        }
      : {
          id_aula: '',
          diaSemana: 'LUNES' as DiaSemana,
          horaInicio: '08:00',
          horaFin: '10:00',
        };
  });

  protected readonly claseForm = form(
    this.claseModel,
    (path) => {
      validate(path.id_aula, ({ value }) =>
        Number(value()) > 0 ? undefined : { kind: 'required', message: 'Seleccioná un aula.' },
      );
      required(path.diaSemana, { message: 'Completá este campo.' });
      required(path.horaInicio, { message: 'Completá este campo.' });
      required(path.horaFin, { message: 'Completá este campo.' });
    },
    {
      submission: {
        action: async () => {
          this.error.set('');
          const raw = this.claseModel();
          if (raw.horaFin <= raw.horaInicio) {
            this.error.set('La hora de fin debe ser posterior al inicio.');
            return;
          }
          const payload = {
            ...raw,
            id_aula: Number(raw.id_aula),
            id_comision: this.comision().id,
          };

          this.client.addClaseFija(payload).subscribe({
            next: () => {
              this.notificationService.show('Clase fija guardada.');
              this.saved.emit();
            },
            error: (err) => this.error.set(mensajeError(err)),
          });
        },
      },
    },
  );
}
