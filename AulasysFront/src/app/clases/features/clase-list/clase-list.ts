import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClaseClient } from '../../data-access/clase-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { AulaClient } from '../../../aulas/data-access/aula-client';
import { Clase } from '../../data-access/clase';
import { mensajeError } from '../../../shared/error-message';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function aIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function inicioSemana(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00`);
  const dia = d.getDay();
  d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
  return aIso(d);
}

function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return aIso(d);
}

@Component({
  imports: [],
  selector: 'app-clase-list',
  styleUrl: './clase-list.css',
  templateUrl: './clase-list.html',
})
export default class ClaseList implements OnInit {
  private readonly client = inject(ClaseClient);
  private readonly materiaClient = inject(MateriaClient);
  private readonly aulaClient = inject(AulaClient);

  protected readonly materias = toSignal(this.materiaClient.getAllMaterias(), {
    initialValue: [],
  });
  protected readonly aulas = toSignal(this.aulaClient.getAllAulas(), {
    initialValue: [],
  });


  protected readonly clases = signal<Clase[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly detail = signal<Clase | null>(null);

 protected readonly initialValues = {
    fecha: new Date().toLocaleDateString('en-CA'),
    materia: '',
    aula: '',
  };

  protected readonly fecha = signal(this.initialValues.fecha);
  protected readonly materia = signal(this.initialValues.materia);
  protected readonly aula = signal(this.initialValues.aula);
  protected readonly vista = signal<'lista' | 'semana'>('lista');

  protected readonly semanaDesde = computed(() =>
    inicioSemana(this.fecha() || new Date().toLocaleDateString('en-CA')),
  );

  protected readonly dias = computed(() =>
    DIAS.map((nombre, i) => {
      const f = sumarDias(this.semanaDesde(), i);
      return { nombre, fecha: f, corta: `${f.slice(8, 10)}/${f.slice(5, 7)}` };
    }),
  );

  protected readonly franjas = computed(() =>
    [...new Set(this.clases().map((c) => this.franjaDe(c)))].sort(),
  );

  ngOnInit() {
    this.buscar();
  }

  franjaDe(c: Clase) {
    return `${c.horaInicio.slice(0, 5)}–${c.horaFin.slice(0, 5)}`;
  }

  celda(fechaDia: string, franja: string): Clase[] {
    return this.clases().filter((c) => c.fecha === fechaDia && this.franjaDe(c) === franja);
  }

  delDia(fechaDia: string): Clase[] {
    return this.clases().filter((c) => c.fecha === fechaDia);
  }

  cambiarVista(nuevaVista: 'lista' | 'semana') {
    if (this.vista() === nuevaVista) return;
    this.vista.set(nuevaVista);
    this.buscar();
  }

  moverSemana(semanas: number) {
    this.fecha.set(sumarDias(this.semanaDesde(), semanas * 7));
    this.buscar();
  }

  buscar() {
    if (!this.fecha()) return;
    this.loading.set(true);
    this.error.set('');
    this.detail.set(null);

    const request$ =
      this.vista() === 'semana'
        ? this.client.getSemana(this.semanaDesde(), this.materia(), this.aula())
        : this.client.getClases(this.fecha(), this.materia(), this.aula());

    request$.subscribe({
      next: (data) => {
        this.clases.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  limpiarFiltros() {
    this.fecha.set(this.initialValues.fecha);
    this.materia.set(this.initialValues.materia);
    this.aula.set(this.initialValues.aula);
    this.buscar();
  }
}
