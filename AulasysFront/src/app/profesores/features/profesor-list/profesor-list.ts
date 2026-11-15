import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ProfesorClient } from '../../data-access/profesor-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { Profesor } from '../../data-access/profesor';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-profesor-list',
  styleUrl: './profesor-list.css',
  templateUrl: './profesor-list.html',
})
export default class ProfesorList implements OnInit {
  private readonly client = inject(ProfesorClient);
  private readonly materiaClient = inject(MateriaClient);
  private readonly router = inject(Router);

  protected readonly profesores = signal<Profesor[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly materias = toSignal(this.materiaClient.getAllMaterias(), {
    initialValue: [],
  });
  protected readonly query = signal('');

  protected readonly filtered = computed(() =>
    this.profesores().filter((p) =>
      `${p.nombre} ${p.email}`.toLowerCase().includes(this.query().toLowerCase()),
    ),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.client.getAllProfesores().subscribe({
      next: (data) => {
        this.profesores.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  names(p: Profesor) {
    return (
      this.materias()
        .filter((m) => p.materiasIds.includes(m.id))
        .map((m) => m.nombre)
        .join(', ') || 'Sin materias asignadas'
    );
  }

  irAAsignar(p: Profesor) {
    this.router.navigate(ROUTE_COMMANDS.editarProfesor(p.id));
  }
}
