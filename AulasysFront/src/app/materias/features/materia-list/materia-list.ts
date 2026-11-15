import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MateriaClient } from '../../data-access/materia-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Materia } from '../../data-access/materia';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-materia-list',
  styleUrl: './materia-list.css',
  templateUrl: './materia-list.html',
})
export default class MateriaList implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(MateriaClient);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly materias = signal<Materia[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly query = signal('');
  protected readonly laboratorio = signal('');

  protected readonly filtered = computed(() =>
    this.materias().filter(
      (m) =>
        m.nombre.toLowerCase().includes(this.query().toLowerCase()) &&
        (!this.laboratorio() || String(m.requiereLaboratorio) === this.laboratorio()),
    ),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.client.getAllMaterias().subscribe({
      next: (data) => {
        this.materias.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  clear() {
    this.query.set('');
    this.laboratorio.set('');
  }

  irANueva() {
    this.router.navigate(ROUTE_COMMANDS.nuevaMateria);
  }

  irAEditar(materia: Materia) {
    this.router.navigate(ROUTE_COMMANDS.editarMateria(materia.id));
  }

  async eliminar(materia: Materia) {
    const confirmed = await this.confirmationService.requestConfirmation(
      `¿Seguro que deseás eliminar la materia "${materia.nombre}"?`,
    );
    if (!confirmed) return;

    this.client.deleteMateria(materia.id).subscribe({
      next: () => {
        this.notificationService.show('Materia eliminada correctamente.');
        this.load();
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
