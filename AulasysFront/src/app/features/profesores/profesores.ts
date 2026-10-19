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
  template: `
    <div class="page-heading">
      <div>
        <h1>Profesores y materias</h1>
        <p>Asigná las materias que puede dictar cada profesor.</p>
      </div>
    </div>
    @if (state.success()) {
      <p class="success" role="status">{{ state.success() }}</p>
    }
    <section class="panel">
      <div class="filters">
        <label
          >Buscar profesor<input
            type="search"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
        /></label>
      </div>
      <app-list-status
        [loading]="data.loading()"
        [error]="data.error()"
        [count]="filtered().length"
        (retry)="data.load()"
      />
      @if (!data.loading() && !data.error() && filtered().length) {
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Materias</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filtered(); track p.id) {
                <tr>
                  <td>
                    <strong>{{ p.nombre }}</strong
                    ><br />{{ p.email }}
                  </td>
                  <td>{{ names(p) }}</td>
                  <td>
                    <button class="button secondary" (click)="open(p)">Asignar materias</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
    @if (state.opened()) {
      <app-modal title="Asignar materias" [busy]="state.busy()" (closed)="state.close()">
        <p>{{ state.editing()?.nombre }}</p>
        @if (state.error()) {
          <p class="alert" role="alert">{{ state.error() }}</p>
        }
        <app-list-status
          [loading]="materias.loading()"
          [error]="materias.error()"
          [count]="materias.items().length"
          (retry)="materias.load()"
        />
        <fieldset [disabled]="state.busy()">
          @for (m of materias.items(); track m.id) {
            <label class="checkbox-field"
              ><input
                type="checkbox"
                [checked]="selected().includes(m.id)"
                (change)="toggle(m.id)"
              /><span>{{ m.nombre }}</span></label
            >
          }
        </fieldset>
        <p class="muted">No se pueden quitar materias con comisiones vigentes.</p>
        <div class="dialog-actions">
          <button class="button secondary" [disabled]="state.busy()" (click)="state.close()">
            Cancelar</button
          ><button
            class="button primary"
            [disabled]="state.busy() || materias.loading() || !!materias.error()"
            (click)="save()"
          >
            Guardar
          </button>
        </div></app-modal
      >
    }
  `,
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
