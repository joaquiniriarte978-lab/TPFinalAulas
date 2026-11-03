import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
import { MateriaClient } from '../../data-access/materia-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Materia } from '../../data-access/materia';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { FieldError } from '../../../shared/field-error/field-error';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormsModule, FormField, Modal, FieldError],
  selector: 'app-materia-list',
  styleUrl: './materia-list.css',
  templateUrl: './materia-list.html',
})
export default class MateriaList {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(MateriaClient);

  protected readonly data = collection(() => this.client.getAllMaterias());
  protected readonly state = crudState<Materia>(this.data.load);
  protected readonly query = signal('');
  protected readonly laboratorio = signal('');
  protected readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (m) =>
          normalize(m.nombre).includes(normalize(this.query())) &&
          (!this.laboratorio() || String(m.requiereLaboratorio) === this.laboratorio()),
      ),
  );
  protected readonly formModel = signal({ nombre: '', requiereLaboratorio: false });
  protected readonly form = form(this.formModel, (path) => {
    validate(path.nombre, ({ value }) =>
      value().trim() ? undefined : { kind: 'required', message: 'Completá este campo.' },
    );
    maxLength(path.nombre, 20);
  });

  clear() {
    this.query.set('');
    this.laboratorio.set('');
  }

  open(materia: Materia | null = null) {
    this.form().reset(materia ?? { nombre: '', requiereLaboratorio: false });
    this.state.open(materia);
  }

  save() {
    this.form().markAsTouched();
    if (this.form().invalid() || !this.auth.isAdmin()) return;
    const value = this.formModel();
    const materia = { ...value, nombre: value.nombre.trim() };
    const id = this.state.editing()?.id;
    this.state.run(
      id == null ? this.client.addMateria(materia) : this.client.editMateria(materia, id),
      this.state.editing() ? 'Materia actualizada correctamente.' : 'Materia creada correctamente.',
    );
  }

  remove() {
    const materia = this.state.deleting();
    if (materia && this.auth.isAdmin())
      this.state.run(this.client.deleteMateria(materia.id), 'Materia eliminada correctamente.');
  }
}
