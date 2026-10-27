import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Reserva, fechaHoy, normalize } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError } from '../../shared/field-error';
import { ListStatus } from '../../shared/list-status';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-reservas',
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.reservas);
  readonly aulas = collection(this.api.aulas);
  readonly comisiones = collection(
    this.auth.isAdmin() ? this.api.comisiones : this.api.misComisiones,
  );
  readonly state = crudState<Reserva>(() => {
    this.detail.set(null);
    this.data.load();
  });
  readonly detail = signal<Reserva | null>(null);
  readonly confirmRelease = signal('');
  readonly query = signal('');
  readonly fecha = signal('');
  readonly scope = signal('');
  readonly history = signal('RESERVADA');
  readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (r) =>
          (!this.history() || r.estadoReserva === this.history()) &&
          (!this.scope() || r.propia) &&
          (!this.fecha() || r.fecha === this.fecha()) &&
          normalize(r.aulaNombre + ' ' + r.materiaNombre + ' ' + r.profesorNombre).includes(
            normalize(this.query()),
          ),
      ),
  );
  readonly formModel = signal({
    id_comision: '',
    id_aula: '',
    fecha: fechaHoy(),
    horaInicio: '',
    horaFin: '',
  });
  readonly form = form(this.formModel, (path) => {
    validate(path.id_comision, ({ value }) =>
      Number(value()) > 0 ? undefined : { kind: 'required' },
    );
    validate(path.id_aula, ({ value }) => (Number(value()) > 0 ? undefined : { kind: 'required' }));
    required(path.fecha);
    required(path.horaInicio);
    required(path.horaFin);
  });
  open(r: Reserva | null = null) {
    this.detail.set(null);
    this.confirmRelease.set('');
    this.form().reset(
      r
        ? {
            id_comision: String(r.id_comision),
            id_aula: String(r.id_aula),
            fecha: r.fecha,
            horaInicio: r.horaInicio.slice(0, 5),
            horaFin: r.horaFin.slice(0, 5),
          }
        : { id_comision: '', id_aula: '', fecha: fechaHoy(), horaInicio: '', horaFin: '' },
    );
    this.state.open(r);
  }
  save(liberar = false) {
    this.form().markAsTouched();
    if (this.form().invalid()) return;
    const raw = this.formModel();
    const v = { ...raw, id_comision: Number(raw.id_comision), id_aula: Number(raw.id_aula) };
    if (v.horaFin <= v.horaInicio) {
      this.state.error.set('La hora de fin debe ser posterior al inicio.');
      return;
    }
    this.state.run(
      this.api.saveReserva({ ...v, liberarClaseFija: liberar }, this.state.editing()?.id),
      'Reserva guardada.',
      undefined,
      (e) => {
        if (e.message.startsWith('CONFIRMACION_LIBERAR_AULA:')) {
          this.confirmRelease.set(e.message.slice('CONFIRMACION_LIBERAR_AULA:'.length).trim());
          this.state.error.set('');
        }
      },
    );
  }
  confirm(r: Reserva) {
    this.detail.set(null);
    this.state.confirmDelete(r);
  }
  remove() {
    const r = this.state.deleting();
    if (!r) return;
    this.state.run(
      r.estadoReserva === 'FINALIZADA'
        ? this.api.deleteReserva(r.id)
        : this.api.cancelarReserva(r.id),
      r.estadoReserva === 'FINALIZADA' ? 'Reserva eliminada.' : 'Reserva cancelada.',
    );
  }
}
