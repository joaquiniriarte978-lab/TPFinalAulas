import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, max, maxLength, min, required, validate } from '@angular/forms/signals';
<<<<<<< HEAD
<<<<<<< Updated upstream:AulasysFront/src/app/aulas/features/aula-list/aulas.ts
=======
>>>>>>> c3dc27cbe825a3c1a1207d9c2ddf84e74d732be1
import { ApiService } from '../../../shared/data-access/api.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aula, TIPOS_AULA, TipoAula } from '../../data-access/aula.model';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import FieldError from '../../../shared/ui/field-error/field-error';
import Modal from '../../../shared/ui/modal/modal';
<<<<<<< HEAD
=======
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Aula, normalize, TIPOS_AULA, TipoAula } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError } from '../../shared/field-error';
import { Modal } from '../../shared/modal';
>>>>>>> Stashed changes:AulasysFront/src/app/features/aulas/aulas.ts
=======
>>>>>>> c3dc27cbe825a3c1a1207d9c2ddf84e74d732be1
@Component({
  selector: 'app-aulas',
  imports: [FormsModule, FormField, Modal, FieldError],
  templateUrl: './aulas.html',
  styleUrl: './aulas.css',
})
export default class Aulas {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.aulas);
  readonly state = crudState<Aula>(this.data.load);
  readonly tipos = TIPOS_AULA;
  readonly query = signal('');
  readonly tipo = signal('');
  readonly capacidad = signal<number | null>(null);
  readonly equipamiento = signal('');
  readonly filtered = computed(() =>
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
  readonly formModel = signal({
    nombre: '',
    capacidad: 30,
    tipo: 'AULA' as TipoAula,
    equipamiento: '',
  });
  readonly form = form(this.formModel, (path) => {
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
    this.state.run(
      this.api.saveAula(
        { ...value, nombre: value.nombre.trim(), equipamiento: value.equipamiento.trim() },
        this.state.editing()?.id,
      ),
      this.state.editing() ? 'Aula actualizada correctamente.' : 'Aula creada correctamente.',
    );
  }
  remove() {
    const aula = this.state.deleting();
    if (aula && this.auth.isAdmin())
      this.state.run(this.api.deleteAula(aula.id), 'Aula eliminada correctamente.');
  }
}
