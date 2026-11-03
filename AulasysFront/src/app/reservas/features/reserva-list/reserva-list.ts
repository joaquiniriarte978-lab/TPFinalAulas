import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { ReservaClient } from '../../data-access/reserva-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { ComisionClient } from '../../../comisiones/data-access/comision-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Reserva } from '../../data-access/reserva';
import { fechaHoy } from '../../../shared/utils/date';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { ListStatus } from '../../../shared/list-status/list-status';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  selector: 'app-reserva-list',
  styleUrl: './reserva-list.css',
  templateUrl: './reserva-list.html',
})
export default class ReservaList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ReservaClient);
  private readonly aulaClient = inject(AulaClient);
  private readonly comisionClient = inject(ComisionClient);

  protected readonly data = collection(() => this.client.getAllReservas());
  protected readonly aulas = collection(() => this.aulaClient.getAllAulas());
  protected readonly comisiones = collection(
    this.auth.isAdmin()
      ? () => this.comisionClient.getAllComisiones()
      : () => this.comisionClient.getMisComisiones(),
  );
  protected readonly state = crudState<Reserva>(() => {
    this.detail.set(null);
    this.data.load();
  });
  protected readonly detail = signal<Reserva | null>(null);
  protected readonly confirmRelease = signal('');
  protected readonly query = signal('');
  protected readonly fecha = signal('');
  protected readonly scope = signal('');
  protected readonly history = signal('RESERVADA');
  protected readonly filtered = computed(() =>
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
  protected readonly formModel = signal({
    id_comision: '',
    id_aula: '',
    fecha: fechaHoy(),
    horaInicio: '',
    horaFin: '',
  });
  protected readonly form = form(this.formModel, (path) => {
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
    const reserva = { ...v, liberarClaseFija: liberar };
    const id = this.state.editing()?.id;
    this.state.run(
      id == null ? this.client.addReserva(reserva) : this.client.editReserva(reserva, id),
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
        ? this.client.deleteReserva(r.id)
        : this.client.cancelReserva(r.id),
      r.estadoReserva === 'FINALIZADA' ? 'Reserva eliminada.' : 'Reserva cancelada.',
    );
  }
}
