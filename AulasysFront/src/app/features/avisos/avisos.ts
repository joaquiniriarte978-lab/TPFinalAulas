import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Aviso } from '../../core/models';
import { collection } from '../../shared/collection';
import { crudState } from '../../shared/crud-state';
import { FieldError, nonBlank } from '../../shared/field-error';
import { ListStatus } from '../../shared/list-status';
import { Modal } from '../../shared/modal';
@Component({
  selector: 'app-avisos',
  imports: [FormsModule, ReactiveFormsModule, FieldError, ListStatus, Modal],
  template: `
    <div class="page-heading">
      <div>
        <h1>Avisos</h1>
        <p>Reportá problemas en las aulas que utilizás.</p>
      </div>
      @if (auth.user()?.rol === 'PROFESOR') {
        <button class="button primary" (click)="open()">Nuevo aviso</button>
      }
    </div>
    @if (state.success()) {
      <p class="success" role="status">{{ state.success() }}</p>
    }
    <section class="panel">
      <div class="filters">
        <label
          >Mostrar<select [ngModel]="scope()" (ngModelChange)="scope.set($event)">
            <option value="">Disponibles</option>
            <option value="mios">Mis avisos</option>
          </select></label
        >
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
                <th>Aula</th>
                <th>Mensaje</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (a of filtered(); track a.id) {
                <tr>
                  <td>{{ a.aulaNombre }}</td>
                  <td class="message-cell">{{ a.mensaje }}</td>
                  <td>{{ a.autorNombre }}</td>
                  <td>{{ a.fecha }}</td>
                  <td>{{ a.estado }}</td>
                  <td>
                    @if (a.propio && auth.user()?.rol === 'PROFESOR') {
                      <button class="button subtle" (click)="open(a)">Editar</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
    @if (state.opened()) {
      <app-modal
        [title]="state.editing() ? 'Editar aviso' : 'Nuevo aviso'"
        [busy]="state.busy()"
        (closed)="state.close()"
      >
        @if (state.error()) {
          <p class="alert" role="alert">{{ state.error() }}</p>
        }
        <app-list-status
          [loading]="aulas.loading()"
          [error]="aulas.error()"
          [count]="aulas.items().length"
          (retry)="aulas.load()"
        />
        <p class="muted">
          Podés reportar aulas con clase fija asignada o donde ya terminó una reserva tuya.
        </p>
        <form [formGroup]="form" (ngSubmit)="save()">
          <fieldset [disabled]="state.busy()">
            <label
              >Aula<select formControlName="id_aula">
                <option [ngValue]="0">Seleccioná un aula</option>
                @for (a of aulas.items(); track a.id) {
                  <option [ngValue]="a.id">{{ a.nombre }}</option>
                }
              </select></label
            ><app-field-error [control]="form.controls.id_aula" />
            <label
              >Mensaje<textarea
                formControlName="mensaje"
                rows="4"
                maxlength="255"
              ></textarea></label
            ><app-field-error [control]="form.controls.mensaje" />
          </fieldset>
          <div class="dialog-actions">
            <button
              type="button"
              class="button secondary"
              [disabled]="state.busy()"
              (click)="state.close()"
            >
              Cancelar</button
            ><button
              class="button primary"
              type="submit"
              [disabled]="state.busy() || aulas.loading() || !!aulas.error()"
            >
              Guardar
            </button>
          </div>
        </form></app-modal
      >
    }
  `,
})
export class Avisos {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly data = collection(this.api.avisos);
  readonly aulas = collection(this.api.aulasAvisos);
  readonly state = crudState<Aviso>(this.data.load);
  readonly scope = signal('');
  readonly filtered = computed(() => this.data.items().filter((a) => !this.scope() || a.propio));
  readonly form = inject(FormBuilder).nonNullable.group({
    id_aula: [0, Validators.min(1)],
    mensaje: ['', [nonBlank, Validators.maxLength(255)]],
  });
  open(a: Aviso | null = null) {
    this.form.reset({ id_aula: a?.idAula ?? 0, mensaje: a?.mensaje ?? '' });
    this.state.open(a);
  }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.state.run(
      this.api.saveAviso({ ...v, mensaje: v.mensaje.trim() }, this.state.editing()?.id),
      'Aviso guardado.',
    );
  }
}
