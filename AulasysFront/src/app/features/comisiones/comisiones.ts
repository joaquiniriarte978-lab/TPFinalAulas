import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Comision, Profesor, Turno, DiaSemana, TURNOS, DIAS, normalize } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError, integer } from '../../shared/field-error';
import { ListStatus } from '../../shared/list-status';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-comisiones',
  imports: [FormsModule, ReactiveFormsModule, FieldError, ListStatus, Modal],
  templateUrl: './comisiones.html',
})
export class Comisiones {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly data = collection(this.auth.isAdmin() ? this.api.comisiones : this.api.misComisiones);
  readonly profesores = collection(() =>
    this.auth.isAdmin() ? this.api.profesores() : of<Profesor[]>([]),
  );
  readonly materias = collection(this.api.materias);
  readonly aulas = collection(this.api.aulas);
  readonly state = crudState<Comision>(() => {
    this.detail.set(null);
    this.data.load();
  });
  readonly detail = signal<Comision | null>(null);
  readonly mode = signal<'comision' | 'clase'>('comision');
  readonly quitarClase = signal(false);
  readonly query = signal('');
  readonly turnos = TURNOS;
  readonly dias = DIAS;
  readonly filtered = computed(() =>
    this.data
      .items()
      .filter((c) =>
        normalize(c.materiaNombre + ' ' + c.profesorNombre + ' ' + c.id).includes(
          normalize(this.query()),
        ),
      ),
  );
  readonly form = this.fb.nonNullable.group({
    id_materia: [0, Validators.min(1)],
    id_profesor: [0, Validators.min(1)],
    cantAlumnos: [1, [Validators.required, Validators.min(1), Validators.max(100), integer]],
    horario: ['MAÑANA' as Turno, Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
  });
  readonly claseForm = this.fb.nonNullable.group({
    id_aula: [0, Validators.min(1)],
    diaSemana: ['LUNES' as DiaSemana, Validators.required],
    horaInicio: ['08:00', Validators.required],
    horaFin: ['10:00', Validators.required],
  });
  constructor() {
    this.form.controls.id_materia.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (!this.opcionesProfesor().some((p) => p.id === this.form.controls.id_profesor.value))
        this.form.controls.id_profesor.setValue(0);
    });
  }
  opcionesProfesor() {
    return this.profesores
      .items()
      .filter((p) => p.materiasIds.includes(this.form.controls.id_materia.value));
  }
  open(c: Comision | null = null) {
    this.detail.set(null);
    this.mode.set('comision');
    this.form.reset(
      c ?? {
        id_materia: 0,
        id_profesor: 0,
        cantAlumnos: 1,
        horario: 'MAÑANA',
        fechaInicio: '',
        fechaFin: '',
      },
    );
    this.state.open(c);
  }
  openClase(c: Comision) {
    this.detail.set(null);
    this.mode.set('clase');
    this.claseForm.reset(
      c.claseFija
        ? {
            ...c.claseFija,
            horaInicio: c.claseFija.horaInicio.slice(0, 5),
            horaFin: c.claseFija.horaFin.slice(0, 5),
          }
        : { id_aula: 0, diaSemana: 'LUNES', horaInicio: '', horaFin: '' },
    );
    this.state.open(c);
  }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.auth.isAdmin()) return;
    this.state.run(
      this.api.saveComision(this.form.getRawValue(), this.state.editing()?.id),
      'Comisión guardada.',
    );
  }
  saveClase() {
    this.claseForm.markAllAsTouched();
    const c = this.state.editing();
    if (!c || this.claseForm.invalid || !this.auth.isAdmin()) return;
    const v = this.claseForm.getRawValue();
    if (v.horaFin <= v.horaInicio) {
      this.state.error.set('La hora de fin debe ser posterior al inicio.');
      return;
    }
    this.state.run(this.api.saveClaseFija({ ...v, id_comision: c.id }), 'Clase fija guardada.');
  }
  confirm(c: Comision, clase = false) {
    this.detail.set(null);
    this.quitarClase.set(clase);
    this.state.confirmDelete(c);
  }
  remove() {
    const c = this.state.deleting();
    if (c && this.auth.isAdmin())
      this.state.run(
        this.quitarClase() ? this.api.deleteClaseFija(c.id) : this.api.deleteComision(c.id),
        this.quitarClase() ? 'Clase fija quitada.' : 'Comisión eliminada.',
      );
  }
}
