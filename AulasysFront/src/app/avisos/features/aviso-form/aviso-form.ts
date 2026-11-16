import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, FormRoot, form, maxLength, validate } from '@angular/forms/signals';
import { AvisoClient } from '../../data-access/aviso-client';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-aviso-form',
  styleUrl: './aviso-form.css',
  templateUrl: './aviso-form.html',
})
export default class AvisoForm implements OnInit {
  private readonly client = inject(AvisoClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly aulas = toSignal(this.client.getAulasHabilitadas(), { initialValue: [] });
  protected readonly error = signal('');
  protected readonly submitting = signal(false);

  protected readonly formModel = signal({ id_aula: '', mensaje: '' });

  protected readonly avisoForm = form(
    this.formModel,
    (path) => {
      validate(path.id_aula, ({ value }) =>
        Number(value()) > 0 ? undefined : { kind: 'required', message: 'Seleccioná un aula.' },
      );
      validate(path.mensaje, ({ value }) =>
        value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
      );
      maxLength(path.mensaje, 255, { message: 'Máximo 255 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          if (this.submitting()) return;
          this.submitting.set(true);
          this.error.set('');
          const raw = this.formModel();
          const payload = { id_aula: Number(raw.id_aula), mensaje: raw.mensaje.trim() };

          const request$ = this.id
            ? this.client.editAviso(payload, this.id)
            : this.client.addAviso(payload);

          request$.subscribe({
            next: () => {
              this.submitting.set(false);
              this.notificationService.show('Aviso guardado.');
              this.router.navigate(ROUTE_COMMANDS.avisos);
            },
            error: (err) => {
              this.submitting.set(false);
              this.error.set(mensajeError(err));
            },
          });
        },
      },
    },
  );

  ngOnInit() {
    if (this.id) {
      this.client.getAvisoById(this.id).subscribe({
        next: (aviso) =>
          this.formModel.set({
            id_aula: String(aviso.idAula),
            mensaje: aviso.mensaje,
          }),
        error: (err) => this.error.set(mensajeError(err)),
      });
    }
  }

  cancelar() {
    this.router.navigate(ROUTE_COMMANDS.avisos);
  }
}
