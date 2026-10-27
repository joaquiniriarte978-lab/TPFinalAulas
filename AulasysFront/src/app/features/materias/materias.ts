import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Materia, normalize } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError } from '../../shared/field-error';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-materias',
  imports: [FormsModule, FormField, Modal, FieldError],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class Materias {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.materias);
  readonly state = crudState<Materia>(this.data.load);
  readonly query = signal('');
  readonly laboratorio = signal('');
  readonly filtered = computed(() =>
    this.data
      .items()
      .filter(
        (m) =>
          normalize(m.nombre).includes(normalize(this.query())) &&
          (!this.laboratorio() || String(m.requiereLaboratorio) === this.laboratorio()),
      ),
  );
  readonly formModel = signal({ nombre: '', requiereLaboratorio: false });
  readonly form = form(this.formModel, (path) => {
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
    this.state.run(
      this.api.saveMateria({ ...value, nombre: value.nombre.trim() }, this.state.editing()?.id),
      this.state.editing() ? 'Materia actualizada correctamente.' : 'Materia creada correctamente.',
    );
  }
  remove() {
    const materia = this.state.deleting();
    if (materia && this.auth.isAdmin())
      this.state.run(this.api.deleteMateria(materia.id), 'Materia eliminada correctamente.');
  }
}
