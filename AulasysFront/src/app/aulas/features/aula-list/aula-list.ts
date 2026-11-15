import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AulaClient } from '../../data-access/aula-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aula, TIPOS_AULA, TipoAula } from '../../data-access/aula';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-aula-list',
  styleUrl: './aula-list.css',
  templateUrl: './aula-list.html',
})
export default class AulaList implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(AulaClient);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly aulas = signal<Aula[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly tipos = TIPOS_AULA;
  protected readonly query = signal('');
  protected readonly tipo = signal('');
  protected readonly capacidad = signal<number | null>(null);
  protected readonly equipamiento = signal('');

  protected readonly filtered = computed(() =>
    this.aulas().filter(
      (a) =>
        a.nombre.toLowerCase().includes(this.query().toLowerCase()) &&
        (!this.tipo() || a.tipo === this.tipo()) &&
        a.capacidad >= (this.capacidad() ?? 0) &&
        (a.equipamiento ?? '').toLowerCase().includes(this.equipamiento().toLowerCase()),
    ),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.client.getAllAulas().subscribe({
      next: (data) => {
        this.aulas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  label(tipo: TipoAula) {
    return this.tipos.find((t) => t.value === tipo)?.label ?? tipo;
  }

  clear() {
    this.query.set('');
    this.tipo.set('');
    this.capacidad.set(null);
    this.equipamiento.set('');
  }

  irANueva() {
    this.router.navigate(ROUTE_COMMANDS.nuevaAula);
  }

  irAEditar(aula: Aula) {
    this.router.navigate(ROUTE_COMMANDS.editarAula(aula.id));
  }

  async eliminar(aula: Aula) {
    const confirmed = await this.confirmationService.requestConfirmation(
      `¿Seguro que deseás eliminar el aula "${aula.nombre}"?`,
    );
    if (!confirmed) return;

    this.client.deleteAula(aula.id).subscribe({
      next: () => {
        this.notificationService.show('Aula eliminada correctamente.');
        this.load();
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
