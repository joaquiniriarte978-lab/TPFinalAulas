import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormField, FormRoot, form, maxLength, validate } from '@angular/forms/signals';
import { MateriaClient } from '../../data-access/materia-client';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-materia-form',
  styleUrl: './materia-form.css',
  templateUrl: './materia-form.html',
})
export default class MateriaForm implements OnInit {
  private readonly client = inject(MateriaClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly error = signal('');
  protected readonly submitting = signal(false);

  protected readonly formModel = signal({
    nombre: '',
    requiereLaboratorio: false,
  });

  protected readonly materiaForm = form(
    this.formModel,
    (path) => {
      validate(path.nombre, ({ value }) =>
        value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
      );
      maxLength(path.nombre, 20, { message: 'Máximo 20 caracteres.' });
    },
    {
      submission: {
        action: async () => {
          if (this.submitting()) return;
          this.submitting.set(true);
          this.error.set('');
          const value = this.formModel();
          const payload = {
            ...value,
            nombre: value.nombre.trim(),
          };

          const request$ = this.id
            ? this.client.editMateria(payload, this.id)
            : this.client.addMateria(payload);

          request$.subscribe({
            next: () => {
              this.submitting.set(false);
              this.notificationService.show(
                this.id ? 'Materia actualizada correctamente.' : 'Materia creada correctamente.',
              );
              this.router.navigate(ROUTE_COMMANDS.materias);
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
      this.client.getMateriaById(this.id).subscribe({
        next: (materia) =>
          this.formModel.set({
            nombre: materia.nombre,
            requiereLaboratorio: materia.requiereLaboratorio,
          }),
        error: (err) => this.error.set(mensajeError(err)),
      });
    }
  }

  cancelar() {
    this.router.navigate(ROUTE_COMMANDS.materias);
  }
}
