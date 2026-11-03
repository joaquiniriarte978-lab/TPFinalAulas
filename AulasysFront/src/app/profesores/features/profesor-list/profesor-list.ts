import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfesorClient } from '../../data-access/profesor-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { Profesor } from '../../data-access/profesor';
import { normalize } from '../../../shared/utils/text';
import { collection } from '../../../shared/utils/collection';
import { crudState } from '../../../shared/utils/crud-state';
import { Modal } from '../../../shared/modal/modal';
import { ListStatus } from '../../../shared/list-status/list-status';

@Component({
  imports: [FormsModule, Modal, ListStatus],
  selector: 'app-profesor-list',
  styleUrl: './profesor-list.css',
  templateUrl: './profesor-list.html',
})
export default class ProfesorList {
  private readonly client = inject(ProfesorClient);
  private readonly materiaClient = inject(MateriaClient);

  protected readonly data = collection(() => this.client.getAllProfesores());
  protected readonly materias = collection(() => this.materiaClient.getAllMaterias());
  protected readonly state = crudState<Profesor>(this.data.load);
  protected readonly query = signal('');
  protected readonly selected = signal<number[]>([]);
  protected readonly filtered = computed(() =>
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
      this.state.run(this.client.editMaterias(this.selected(), p.id), 'Asignaciones actualizadas.');
  }
}
