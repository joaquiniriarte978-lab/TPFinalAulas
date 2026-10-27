import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
import { ApiService } from '../../../shared/data-access/api.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aviso } from '../../data-access/aviso.model';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import FieldError from '../../../shared/ui/field-error/field-error';
import ListStatus from '../../../shared/ui/list-status/list-status';
import Modal from '../../../shared/ui/modal/modal';
@Component({
  selector: 'app-avisos',
  imports: [FormsModule, FormField, FieldError, ListStatus, Modal],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css',
})
export default class Avisos {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.avisos);
  readonly aulas = collection(this.api.aulasAvisos);
  readonly state = crudState<Aviso>(this.data.load);
  readonly scope = signal('');
  readonly filtered = computed(() => this.data.items().filter((a) => !this.scope() || a.propio));
  readonly formModel = signal({ id_aula: '', mensaje: '' });
  readonly form = form(this.formModel, (path) => {
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
    this.state.run(
      this.api.saveAviso({ ...v, mensaje: v.mensaje.trim() }, this.state.editing()?.id),
      'Aviso guardado.',
    );
  }
}
