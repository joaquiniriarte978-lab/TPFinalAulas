import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ApiService } from '../../../shared/data-access/api.service';
import { Clase } from '../../data-access/clase.model';
import { fechaHoy } from '../../../shared/utils/date';
import { collection } from '../../../shared/utils/collection';
import ListStatus from '../../../shared/ui/list-status/list-status';
import Modal from '../../../shared/ui/modal/modal';
@Component({
  selector: 'app-clases',
  imports: [FormField, ListStatus, Modal],
  templateUrl: './clases.html',
  styleUrl: './clases.css',
})
export default class Clases {
  private readonly api = inject(ApiService);
  readonly filterModel = signal({ fecha: fechaHoy(), materia: '', aula: '' });
  readonly filters = form(this.filterModel, (path) => required(path.fecha));
  readonly materias = collection(this.api.materias);
  readonly aulas = collection(this.api.aulas);
  readonly data = collection(() =>
    this.api.clases(this.filterModel().fecha, this.filterModel().materia, this.filterModel().aula),
  );
  readonly detail = signal<Clase | null>(null);
  buscar() {
    this.filters().markAsTouched();
    if (this.filters().valid()) this.data.load();
  }
}
