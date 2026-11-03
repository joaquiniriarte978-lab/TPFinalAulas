import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ClaseClient } from '../../data-access/clase-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { Clase } from '../../data-access/clase';
import { fechaHoy } from '../../../shared/utils/date';
import { collection } from '../../../shared/utils/collection';
import { ListStatus } from '../../../shared/list-status/list-status';
import { Modal } from '../../../shared/modal/modal';

@Component({
  imports: [FormField, ListStatus, Modal],
  selector: 'app-clase-list',
  styleUrl: './clase-list.css',
  templateUrl: './clase-list.html',
})
export default class ClaseList {
  private readonly client = inject(ClaseClient);
  private readonly materiaClient = inject(MateriaClient);
  private readonly aulaClient = inject(AulaClient);

  protected readonly filterModel = signal({ fecha: fechaHoy(), materia: '', aula: '' });
  protected readonly filters = form(this.filterModel, (path) => required(path.fecha));
  protected readonly materias = collection(() => this.materiaClient.getAllMaterias());
  protected readonly aulas = collection(() => this.aulaClient.getAllAulas());
  protected readonly data = collection(() =>
    this.client.getClases(
      this.filterModel().fecha,
      this.filterModel().materia,
      this.filterModel().aula,
    ),
  );
  protected readonly detail = signal<Clase | null>(null);

  buscar() {
    this.filters().markAsTouched();
    if (this.filters().valid()) this.data.load();
  }
}
