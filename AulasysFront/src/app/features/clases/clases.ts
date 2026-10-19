import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Clase, fechaHoy } from '../../core/models';
import { collection } from '../../shared/collection';
import { ListStatus } from '../../shared/list-status';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-clases',
  imports: [FormsModule, ListStatus, Modal],
  template: `
    <div class="page-heading">
      <div>
        <h1>Clases</h1>
        <p>Consultá el aula donde se dicta cada clase.</p>
      </div>
    </div>
    <section class="panel">
      <form class="filters" (ngSubmit)="buscar()">
        <label>Fecha<input type="date" name="fecha" [(ngModel)]="fecha" required /></label>
        <label
          >Materia<select name="materia" [(ngModel)]="materia">
            <option value="">Todas</option>
            @for (m of materias.items(); track m.id) {
              <option [value]="m.id">{{ m.nombre }}</option>
            }
          </select></label
        >
        <label
          >Aula<select name="aula" [(ngModel)]="aula">
            <option value="">Todas</option>
            @for (a of aulas.items(); track a.id) {
              <option [value]="a.id">{{ a.nombre }}</option>
            }
          </select></label
        >
        <button type="submit" class="button primary" [disabled]="data.loading() || !fecha">
          Consultar
        </button>
      </form>
      @if (materias.error() || aulas.error()) {
        <p class="alert">
          No se pudieron cargar los filtros.
          <button class="button subtle" (click)="materias.load(); aulas.load()">Reintentar</button>
        </p>
      }
      <app-list-status
        [loading]="data.loading()"
        [error]="data.error()"
        [count]="data.items().length"
        (retry)="buscar()"
      />
      @if (!data.loading() && !data.error() && data.items().length) {
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Materia</th>
                <th>Horario</th>
                <th>Aula efectiva</th>
                <th>Tipo</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              @for (c of data.items(); track $index) {
                <tr>
                  <td>{{ c.materiaNombre }} · #{{ c.comisionId }}</td>
                  <td>{{ c.horaInicio.slice(0, 5) }}–{{ c.horaFin.slice(0, 5) }}</td>
                  <td>
                    <strong>{{ c.aulaNombre }}</strong>
                  </td>
                  <td>{{ c.origen === 'RESERVA' ? 'Reserva puntual' : 'Clase semanal' }}</td>
                  <td>
                    <button class="button subtle" (click)="detail.set(c)">Ver detalle</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
    @if (detail(); as c) {
      <app-modal title="Detalle de clase" (closed)="detail.set(null)"
        ><dl class="details">
          <dt>Materia</dt>
          <dd>{{ c.materiaNombre }}</dd>
          <dt>Comisión</dt>
          <dd>#{{ c.comisionId }}</dd>
          <dt>Profesor</dt>
          <dd>{{ c.profesorNombre }}</dd>
          <dt>Fecha</dt>
          <dd>{{ c.fecha }}</dd>
          <dt>Horario</dt>
          <dd>{{ c.horaInicio.slice(0, 5) }}–{{ c.horaFin.slice(0, 5) }}</dd>
          <dt>Aula</dt>
          <dd>{{ c.aulaNombre }}</dd>
        </dl></app-modal
      >
    }
  `,
})
export class Clases {
  private readonly api = inject(ApiService);
  fecha = fechaHoy();
  materia = '';
  aula = '';
  readonly materias = collection(this.api.materias);
  readonly aulas = collection(this.api.aulas);
  readonly data = collection(() => this.api.clases(this.fecha, this.materia, this.aula));
  readonly detail = signal<Clase | null>(null);
  buscar() {
    if (this.fecha) this.data.load();
  }
}
