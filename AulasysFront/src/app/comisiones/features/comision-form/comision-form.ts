import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormField, FormRoot, form, max, min, required, validate } from '@angular/forms/signals';
import { ComisionClient } from '../../data-access/comision-client';
import { ProfesorClient } from '../../../profesores/data-access/profesor-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { Comision, TURNOS, Turno } from '../../data-access/comision';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { FieldError } from '../../../shared/field-error/field-error';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [FormRoot, FormField, FieldError],
  selector: 'app-comision-form',
  styleUrl: './comision-form.css',
  templateUrl: './comision-form.html',
})
export default class ComisionForm {
  private readonly client = inject(ComisionClient);
  private readonly profesorClient = inject(ProfesorClient);
  private readonly materiaClient = inject(MateriaClient);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly editingComision = input<Comision>();
  readonly saved = output<Comision>();
  readonly cancelled = output<void>();

  protected readonly turnos = TURNOS;
  protected readonly error = signal('');
  protected readonly submitting = signal(false);
  protected readonly materias = toSignal(this.materiaClient.getAllMaterias(), {
    initialValue: [],
  });
  protected readonly profesores = toSignal(this.profesorClient.getAllProfesores(), {
    initialValue: [],
  });

  protected readonly formModel = linkedSignal(() => {
    const c = this.editingComision();
    return c
      ? {
          id_materia: String(c.id_materia),
          id_profesor: String(c.id_profesor),
          cantAlumnos: c.cantAlumnos,
          horario: c.horario,
          fechaInicio: c.fechaInicio,
          fechaFin: c.fechaFin,
        }
      : {
          id_materia: '',
          id_profesor: '',
          cantAlumnos: 1,
          horario: 'MAÑANA' as Turno,
          fechaInicio: '',
          fechaFin: '',
        };
  });

  protected readonly opcionesProfesor = computed(() =>
    this.profesores().filter((p) => p.materiasIds.includes(Number(this.formModel().id_materia))),
  );

  protected readonly comisionForm = form(
    this.formModel,
    (path) => {
      validate(path.id_materia, ({ value }) =>
        Number(value()) > 0 ? undefined : { kind: 'required', message: 'Seleccioná una materia.' },
      );
      validate(path.id_profesor, ({ value }) =>
        Number(value()) > 0 ? undefined : { kind: 'required', message: 'Seleccioná un profesor.' },
      );
      min(path.cantAlumnos, 1, { message: 'El mínimo es 1 alumno.' });
      max(path.cantAlumnos, 100, { message: 'El máximo es 100 alumnos.' });
      validate(path.cantAlumnos, ({ value }) =>
        Number.isInteger(value())
          ? undefined
          : { kind: 'integer', message: 'Ingresá un número entero.' },
      );
      required(path.horario, { message: 'Completá este campo.' });
      required(path.fechaInicio, { message: 'Completá este campo.' });
      required(path.fechaFin, { message: 'Completá este campo.' });
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
            id_materia: Number(value.id_materia),
            id_profesor: Number(value.id_profesor),
          };
          const current = this.editingComision();
          const request$ = current
            ? this.client.editComision(payload, current.id)
            : this.client.addComision(payload);

          request$.subscribe({
            next: (res) => {
              this.submitting.set(false);
              this.notificationService.show('Comisión guardada.');
              if (current) {
                this.saved.emit(res);
              } else {
                this.router.navigate(ROUTE_COMMANDS.comisiones);
              }
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

  onMateriaChange() {
    if (!this.opcionesProfesor().some((p) => p.id === Number(this.formModel().id_profesor))) {
      this.formModel.update((value) => ({ ...value, id_profesor: '' }));
    }
  }

  cancelar() {
    if (this.editingComision()) {
      this.cancelled.emit();
    } else {
      this.router.navigate(ROUTE_COMMANDS.comisiones);
    }
  }
}
