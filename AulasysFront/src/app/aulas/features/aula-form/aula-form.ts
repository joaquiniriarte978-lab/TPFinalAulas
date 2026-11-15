import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormField,
  FormRoot,
  form,
  max,
  maxLength,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { AulaClient } from '../../data-access/aula-client';
import { TIPOS_AULA, TipoAula } from '../../data-access/aula';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-aula-form',
  styleUrl: './aula-form.css',
  templateUrl: './aula-form.html',
})
export default class AulaForm implements OnInit {
  private readonly client = inject(AulaClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly tipos = TIPOS_AULA;
  protected readonly error = signal('');

  protected readonly formModel = signal({
    nombre: '',
    capacidad: 30,
    tipo: 'AULA' as TipoAula,
    equipamiento: '',
  });

  protected readonly aulaForm = form(
    this.formModel,
    (path) => {
      validate(path.nombre, ({ value }) =>
        value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
      );
      maxLength(path.nombre, 20, { message: 'Máximo 20 caracteres.' });
      min(path.capacidad, 1, { message: 'El valor mínimo es 1.' });
      max(path.capacidad, 100, { message: 'El valor máximo es 100.' });
      validate(path.capacidad, ({ value }) =>
        Number.isInteger(value())
          ? undefined
          : { kind: 'integer', message: 'Ingresá un número entero.' },
      );
      required(path.tipo, { message: 'Completá este campo.' });
      maxLength(path.equipamiento, 255, { message: 'Máximo 255 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          this.error.set('');
          const value = this.formModel();
          const payload = {
            ...value,
            nombre: value.nombre.trim(),
            equipamiento: value.equipamiento.trim() || null,
          };

          const request$ = this.id
            ? this.client.editAula(payload, this.id)
            : this.client.addAula(payload);

          request$.subscribe({
            next: () => {
              this.notificationService.show(
                this.id ? 'Aula actualizada correctamente.' : 'Aula creada correctamente.',
              );
              this.router.navigate(ROUTE_COMMANDS.aulas);
            },
            error: (err) => this.error.set(mensajeError(err)),
          });
        },
      },
    },
  );

  ngOnInit() {
    if (this.id) {
      this.client.getAulaById(this.id).subscribe({
        next: (aula) =>
          this.formModel.set({
            nombre: aula.nombre,
            capacidad: aula.capacidad,
            tipo: aula.tipo,
            equipamiento: aula.equipamiento ?? '',
          }),
        error: (err) => this.error.set(mensajeError(err)),
      });
    }
  }

  cancelar() {
    this.router.navigate(ROUTE_COMMANDS.aulas);
  }
}
