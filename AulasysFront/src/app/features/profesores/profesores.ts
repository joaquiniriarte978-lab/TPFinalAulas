import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Profesor, normalize } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { Modal } from '../../shared/modal';
import { ListStatus } from '../../shared/list-status';
@Component({
  selector: 'app-profesores',
  imports: [FormsModule, Modal, ListStatus],
  templateUrl: './profesores.html',
  styleUrl: './profesores.css',
})
export class Profesores {
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.profesores);
  readonly materias = collection(this.api.materias);
  readonly state = crudState<Profesor>(this.data.load);
  readonly query = signal('');
  readonly selected = signal<number[]>([]);
  readonly filtered = computed(() =>
    this.data
      .items()
      .filter((p) => normalize(p.nombre + ' ' + p.email).includes(normalize(this.query()))),
  );
  names(p: Profesor) {
    return (
      this.materias
        .items()
        .filter((m) => p.materiasIds.includes(m.id))
        .map((m) => m.nombre)
        .join(', ') || 'Sin materias asignadas'
    );
  }
  open(p: Profesor) {
    this.selected.set([...p.materiasIds]);
    this.state.open(p);
  }
  toggle(id: number) {
    this.selected.update((v) => (v.includes(id) ? v.filter((i) => i !== id) : [...v, id]));
  }
  save() {
    const p = this.state.editing();
    if (p)
      this.state.run(this.api.asignarMaterias(p.id, this.selected()), 'Asignaciones actualizadas.');
  }
}
