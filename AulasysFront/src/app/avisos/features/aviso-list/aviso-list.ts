import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
import { AvisoClient } from '../../data-access/aviso-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aviso, ESTADO_KEYS, ESTADOS, EstadoAviso } from '../../data-access/aviso';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { ListStatus } from '../../../shared/list-status/list-status';
import { Modal } from '../../../shared/modal/modal';

type Alcance = 'pendientes' | 'mios' | 'todos';

@Component({
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  selector: 'app-aviso-list',
  styleUrl: './aviso-list.css',
  templateUrl: './aviso-list.html',
})
export default class AvisoList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(AvisoClient);

  protected readonly estados = ESTADOS;
  protected readonly estadoKeys = ESTADO_KEYS;
  protected readonly data = collection(() => this.client.getAllAvisos());
  protected readonly aulas = collection(() => this.client.getAulasHabilitadas());
  protected readonly state = crudState<Aviso>(this.data.load);
  protected readonly scope = signal<Alcance>(this.auth.isAdmin() ? 'todos' : 'pendientes');
  protected readonly estado = signal<EstadoAviso | ''>('');

  protected readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (a) =>
          (this.scope() === 'todos' ||
            (this.scope() === 'mios' ? a.propio : a.estado === 'PENDIENTE')) &&
          (!this.estado() || a.estado === this.estado()),
      ),
  );

  protected readonly resumen = computed(() => {
    const todos = this.data.items();
    const mios = todos.filter((a) => a.propio);
    const contar = (lista: Aviso[], e: EstadoAviso) => lista.filter((a) => a.estado === e).length;
    return {
      pendientes: contar(todos, 'PENDIENTE'),
      enRevision: contar(todos, 'EN_REVISION'),
      resueltos: contar(todos, 'RESUELTO'),
      misPendientes: contar(mios, 'PENDIENTE'),
      misEnRevision: contar(mios, 'EN_REVISION'),
      misResueltos: contar(mios, 'RESUELTO'),
    };
  });

  protected readonly formModel = signal({ id_aula: '', mensaje: '' });
  protected readonly form = form(this.formModel, (path) => {
    validate(path.id_aula, ({ value }) => (Number(value()) > 0 ? undefined : { kind: 'required' }));
    validate(path.mensaje, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    maxLength(path.mensaje, 255);
  });

  open(a: Aviso | null = null) {
    if (a && a.estado !== 'PENDIENTE') return;
    this.form().reset({ id_aula: a ? String(a.idAula) : '', mensaje: a?.mensaje ?? '' });
    this.state.open(a);
  }

  save() {
    this.form().markAsTouched();
    if (this.form().invalid()) return;
    const raw = this.formModel();
    const aviso = { id_aula: Number(raw.id_aula), mensaje: raw.mensaje.trim() };
    const id = this.state.editing()?.id;
    this.state.run(
      id == null ? this.client.addAviso(aviso) : this.client.editAviso(aviso, id),
      'Aviso guardado.',
    );
  }

  cambiarEstado(a: Aviso, estado: EstadoAviso) {
    if (!this.auth.isAdmin() || estado === a.estado) return;
    this.state.run(
      this.client.cambiarEstado(a.id, estado),
      `Aviso marcado como ${ESTADOS[estado].toLowerCase()}.`,
      undefined,
      () => this.data.load(), // si falla, se recarga y el select vuelve al estado real
    );
  }

  remove() {
    const a = this.state.deleting();
    if (a && a.estado === 'RESUELTO' && this.auth.isAdmin())
      this.state.run(this.client.deleteAviso(a.id), 'Aviso eliminado.');
  }
}
