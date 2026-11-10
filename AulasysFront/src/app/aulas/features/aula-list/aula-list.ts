import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, max, maxLength, min, required, validate } from '@angular/forms/signals';
import { AulaClient } from '../../data-access/aula-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aula, TIPOS_AULA, TipoAula } from '../../data-access/aula';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormsModule, FormField, Modal, FieldError],
  selector: 'app-aula-list',
  styleUrl: './aula-list.css',
  templateUrl: './aula-list.html',
})
export default class AulaList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(AulaClient);

  protected readonly data = collection(() => this.client.getAllAulas());
  protected readonly state = crudState<Aula>(this.data.load);
  protected readonly tipos = TIPOS_AULA;
  protected readonly query = signal('');
  protected readonly tipo = signal('');
  protected readonly capacidad = signal<number | null>(null);
  protected readonly equipamiento = signal('');
  protected readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (a) =>
          normalize(a.nombre).includes(normalize(this.query())) &&
          (!this.tipo() || a.tipo === this.tipo()) &&
          a.capacidad >= (this.capacidad() ?? 0) &&
          normalize(a.equipamiento ?? '').includes(normalize(this.equipamiento())),
      ),
  );
  protected readonly formModel = signal({
    nombre: '',
    capacidad: 30,
    tipo: 'AULA' as TipoAula,
    equipamiento: '',
  });
  protected readonly form = form(this.formModel, (path) => {
    validate(path.nombre, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    maxLength(path.nombre, 20);
    min(path.capacidad, 1);
    max(path.capacidad, 100);
    validate(path.capacidad, ({ value }) =>
      Number.isInteger(value()) ? undefined : { kind: 'integer' },
    );
    required(path.tipo);
    maxLength(path.equipamiento, 255);
  });

  label(tipo: TipoAula) {
    return this.tipos.find((t) => t.value === tipo)?.label ?? tipo;
  }

  clear() {
    this.query.set('');
    this.tipo.set('');
    this.capacidad.set(null);
    this.equipamiento.set('');
  }

  open(aula: Aula | null = null) {
    this.form().reset(
      aula
        ? { ...aula, equipamiento: aula.equipamiento ?? '' }
        : { nombre: '', capacidad: 30, tipo: 'AULA', equipamiento: '' },
    );
    this.state.open(aula);
  }

  save() {
    this.form().markAsTouched();
    if (this.form().invalid() || !this.auth.isAdmin()) return;
    const value = this.formModel();
    const aula = { ...value, nombre: value.nombre.trim(), equipamiento: value.equipamiento.trim() };
    const id = this.state.editing()?.id;
    this.state.run(
      id == null ? this.client.addAula(aula) : this.client.editAula(aula, id),
      this.state.editing() ? 'Aula actualizada correctamente.' : 'Aula creada correctamente.',
    );
  }

  remove() {
    const aula = this.state.deleting();
    if (aula && this.auth.isAdmin())
      this.state.run(this.client.deleteAula(aula.id), 'Aula eliminada correctamente.');
  }

  // .
}
