import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Comision, Profesor, Turno, DiaSemana, TURNOS, DIAS, normalize } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError } from '../../shared/field-error';
import { ListStatus } from '../../shared/list-status';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-comisiones',
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  templateUrl: './comisiones.html',
  styleUrl: './comisiones.css',
})
export class Comisiones {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
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
  readonly formModel = signal({
    id_materia: '',
    id_profesor: '',
    cantAlumnos: 1,
    horario: 'MAÑANA' as Turno,
    fechaInicio: '',
    fechaFin: '',
  });
  readonly form = form(this.formModel, (path) => {
    validate(path.id_materia, ({ value }) =>
      Number(value()) > 0 ? undefined : { kind: 'required' },
    );
    validate(path.id_profesor, ({ value }) =>
      Number(value()) > 0 ? undefined : { kind: 'required' },
    );
    min(path.cantAlumnos, 1);
    max(path.cantAlumnos, 100);
    validate(path.cantAlumnos, ({ value }) =>
      Number.isInteger(value()) ? undefined : { kind: 'integer' },
    );
    required(path.horario);
    required(path.fechaInicio);
    required(path.fechaFin);
  });
  readonly claseModel = signal({
    id_aula: '',
    diaSemana: 'LUNES' as DiaSemana,
    horaInicio: '08:00',
    horaFin: '10:00',
  });
  readonly claseForm = form(this.claseModel, (path) => {
    validate(path.id_aula, ({ value }) => (Number(value()) > 0 ? undefined : { kind: 'required' }));
    required(path.diaSemana);
    required(path.horaInicio);
    required(path.horaFin);
  });
  opcionesProfesor() {
    return this.profesores
      .items()
      .filter((p) => p.materiasIds.includes(Number(this.formModel().id_materia)));
  }
  onMateriaChange() {
    if (!this.opcionesProfesor().some((p) => p.id === Number(this.formModel().id_profesor)))
      this.formModel.update((value) => ({ ...value, id_profesor: '' }));
  }
  open(c: Comision | null = null) {
    this.detail.set(null);
    this.mode.set('comision');
    this.form().reset(
      c
        ? { ...c, id_materia: String(c.id_materia), id_profesor: String(c.id_profesor) }
        : {
            id_materia: '',
            id_profesor: '',
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
    this.claseForm().reset(
      c.claseFija
        ? {
            ...c.claseFija,
            id_aula: String(c.claseFija.id_aula),
            horaInicio: c.claseFija.horaInicio.slice(0, 5),
            horaFin: c.claseFija.horaFin.slice(0, 5),
          }
        : { id_aula: '', diaSemana: 'LUNES', horaInicio: '', horaFin: '' },
    );
    this.state.open(c);
  }
  save() {
    this.form().markAsTouched();
    if (this.form().invalid() || !this.auth.isAdmin()) return;
    const value = this.formModel();
    this.state.run(
      this.api.saveComision(
        { ...value, id_materia: Number(value.id_materia), id_profesor: Number(value.id_profesor) },
        this.state.editing()?.id,
      ),
      'Comisión guardada.',
    );
  }
  saveClase() {
    this.claseForm().markAsTouched();
    const c = this.state.editing();
    if (!c || this.claseForm().invalid() || !this.auth.isAdmin()) return;
    const raw = this.claseModel();
    const v = { ...raw, id_aula: Number(raw.id_aula) };
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
