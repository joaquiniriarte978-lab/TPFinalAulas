import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ClaseClient } from '../../data-access/clase-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { Clase } from '../../data-access/clase';
import { fechaHoy, inicioSemana, sumarDias } from '../../../shared/utils/date';
import { collection } from '../../../shared/utils/collection';
import { ListStatus } from '../../../shared/list-status/list-status';
import { Modal } from '../../../shared/modal/modal';
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const franjaDe = (c: Clase) => `${c.horaInicio.slice(0, 5)}–${c.horaFin.slice(0, 5)}`;
const corta = (fecha: string) => `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;

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

   protected readonly vista = signal<'lista' | 'semana'>('lista');
  protected readonly semanaDesde = computed(() =>
    inicioSemana(this.filterModel().fecha || fechaHoy()),
  );
  protected readonly semana = collection(() =>
    this.client.getSemana(this.semanaDesde(), this.filterModel().materia, this.filterModel().aula),
  );
  protected readonly dias = computed(() =>
    DIAS.map((nombre, i) => {
      const fecha = sumarDias(this.semanaDesde(), i);
      return { nombre, fecha, corta: corta(fecha) };
    }),
  );
  protected readonly franjas = computed(() =>
    [...new Set(this.semana.items().map(franjaDe))].sort(),
  );
  private readonly grilla = computed(() => {
    const mapa = new Map<string, Clase[]>();
    for (const c of this.semana.items()) {
      const key = `${c.fecha}|${franjaDe(c)}`;
      mapa.set(key, [...(mapa.get(key) ?? []), c]);
    }
    return mapa;
  });
  protected readonly franjaDe = franjaDe;

  celda(fecha: string, franja: string): Clase[] {
    return this.grilla().get(`${fecha}|${franja}`) ?? [];
  }

  delDia(fecha: string): Clase[] {
    return this.semana.items().filter((c) => c.fecha === fecha);
  }

  cambiarVista(vista: 'lista' | 'semana') {
    if (this.vista() === vista) return;
    this.vista.set(vista);
    this.buscar();
  }

  moverSemana(semanas: number) {
    this.filterModel.update((m) => ({ ...m, fecha: sumarDias(this.semanaDesde(), semanas * 7) }));
    this.semana.load();
  }

  buscar() {
    this.filters().markAsTouched();
    if (!this.filters().valid()) return;
    if (this.vista() === 'semana') this.semana.load();
    else this.data.load();
  }
}
