import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ApiService } from '../../core/api.service';
import { Clase, fechaHoy } from '../../core/models';
import { collection } from '../../shared/collection';
import { ListStatus } from '../../shared/list-status';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-clases',
  imports: [FormField, ListStatus, Modal],
  templateUrl: './clases.html',
  styleUrl: './clases.css',
})
export class Clases {
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
