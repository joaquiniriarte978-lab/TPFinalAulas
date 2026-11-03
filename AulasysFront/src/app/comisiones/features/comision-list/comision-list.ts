import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { of } from 'rxjs';
import { ComisionClient } from '../../data-access/comision-client';
import { ProfesorClient } from '../../../profesores/data-access/profesor-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Comision, Turno, DiaSemana, TURNOS, DIAS } from '../../data-access/comision';
import { Profesor } from '../../../profesores/data-access/profesor';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { ListStatus } from '../../../shared/list-status/list-status';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  selector: 'app-comision-list',
  styleUrl: './comision-list.css',
  templateUrl: './comision-list.html',
})
export default class ComisionList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ComisionClient);
  private readonly profesorClient = inject(ProfesorClient);
  private readonly materiaClient = inject(MateriaClient);
  private readonly aulaClient = inject(AulaClient);

  protected readonly data = collection(
    this.auth.isAdmin()
      ? () => this.client.getAllComisiones()
      : () => this.client.getMisComisiones(),
  );
  protected readonly profesores = collection(() =>
    this.auth.isAdmin() ? this.profesorClient.getAllProfesores() : of<Profesor[]>([]),
  );
  protected readonly materias = collection(() => this.materiaClient.getAllMaterias());
  protected readonly aulas = collection(() => this.aulaClient.getAllAulas());
  protected readonly state = crudState<Comision>(() => {
    this.detail.set(null);
    this.data.load();
  });
  protected readonly detail = signal<Comision | null>(null);
  protected readonly mode = signal<'comision' | 'clase'>('comision');
  protected readonly quitarClase = signal(false);
  protected readonly query = signal('');
  protected readonly turnos = TURNOS;
  protected readonly dias = DIAS;
  protected readonly filtered = computed(() =>
    this.data
      .items()
      .filter((c) =>
        normalize(c.materiaNombre + ' ' + c.profesorNombre + ' ' + c.id).includes(
          normalize(this.query()),
        ),
      ),
  );
  protected readonly formModel = signal({
    id_materia: '',
    id_profesor: '',
    cantAlumnos: 1,
    horario: 'MAÑANA' as Turno,
    fechaInicio: '',
    fechaFin: '',
  });
  protected readonly form = form(this.formModel, (path) => {
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
  protected readonly claseModel = signal({
    id_aula: '',
    diaSemana: 'LUNES' as DiaSemana,
    horaInicio: '08:00',
    horaFin: '10:00',
  });
  protected readonly claseForm = form(this.claseModel, (path) => {
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
    const comision = {
      ...value,
      id_materia: Number(value.id_materia),
      id_profesor: Number(value.id_profesor),
    };
    const id = this.state.editing()?.id;
    this.state.run(
      id == null ? this.client.addComision(comision) : this.client.editComision(comision, id),
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
    this.state.run(this.client.addClaseFija({ ...v, id_comision: c.id }), 'Clase fija guardada.');
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
        this.quitarClase() ? this.client.deleteClaseFija(c.id) : this.client.deleteComision(c.id),
        this.quitarClase() ? 'Clase fija quitada.' : 'Comisión eliminada.',
      );
  }
}
