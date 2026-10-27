import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength, validate } from '@angular/forms/signals';
<<<<<<< HEAD
<<<<<<< Updated upstream:AulasysFront/src/app/materias/features/materia-list/materias.ts
=======
>>>>>>> c3dc27cbe825a3c1a1207d9c2ddf84e74d732be1
import { ApiService } from '../../../shared/data-access/api.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Materia } from '../../data-access/materia.model';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import FieldError from '../../../shared/ui/field-error/field-error';
import Modal from '../../../shared/ui/modal/modal';
<<<<<<< HEAD
=======
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Materia, normalize } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError } from '../../shared/field-error';
import { Modal } from '../../shared/modal';
>>>>>>> Stashed changes:AulasysFront/src/app/features/materias/materias.ts
=======
>>>>>>> c3dc27cbe825a3c1a1207d9c2ddf84e74d732be1
@Component({
  selector: 'app-materias',
  imports: [FormsModule, FormField, Modal, FieldError],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export default class Materias {
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
