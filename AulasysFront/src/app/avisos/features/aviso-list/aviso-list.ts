import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
import { AvisoClient } from '../../data-access/aviso-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aviso } from '../../data-access/aviso';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { ListStatus } from '../../../shared/list-status/list-status';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  selector: 'app-aviso-list',
  styleUrl: './aviso-list.css',
  templateUrl: './aviso-list.html',
})
export default class AvisoList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(AvisoClient);

  protected readonly data = collection(() => this.client.getAllAvisos());
  protected readonly aulas = collection(() => this.client.getAulasHabilitadas());
  protected readonly state = crudState<Aviso>(this.data.load);
  protected readonly scope = signal('');
  protected readonly filtered = computed(() =>
    this.data.items().filter((a) => !this.scope() || a.propio),
  );
  protected readonly formModel = signal({ id_aula: '', mensaje: '' });
  protected readonly form = form(this.formModel, (path) => {
    validate(path.id_aula, ({ value }) => (Number(value()) > 0 ? undefined : { kind: 'required' }));
    validate(path.mensaje, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    maxLength(path.mensaje, 255);
  });

  open(a: Aviso | null = null) {
    this.form().reset({ id_aula: a ? String(a.idAula) : '', mensaje: a?.mensaje ?? '' });
    this.state.open(a);
  }

  save() {
    this.form().markAsTouched();
    if (this.form().invalid()) return;
    const raw = this.formModel();
    const v = { ...raw, id_aula: Number(raw.id_aula) };
    const aviso = { ...v, mensaje: v.mensaje.trim() };
    const id = this.state.editing()?.id;
    this.state.run(
      id == null ? this.client.addAviso(aviso) : this.client.editAviso(aviso, id),
      'Aviso guardado.',
    );
  }
}
