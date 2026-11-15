import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AvisoClient } from '../../data-access/aviso-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Aviso, ESTADO_KEYS, ESTADOS, EstadoAviso } from '../../data-access/aviso';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

type Alcance = 'pendientes' | 'mios' | 'todos';

@Component({
  imports: [],
  selector: 'app-aviso-list',
  styleUrl: './aviso-list.css',
  templateUrl: './aviso-list.html',
})
export default class AvisoList implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(AvisoClient);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly avisos = signal<Aviso[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly estados = ESTADOS;
  protected readonly estadoKeys = ESTADO_KEYS;
  protected readonly scope = signal<Alcance>(this.auth.isAdmin() ? 'todos' : 'pendientes');
  protected readonly estado = signal<EstadoAviso | ''>('');

  protected readonly filtered = computed(() =>
    this.avisos().filter(
      (a) =>
        (this.scope() === 'todos' ||
          (this.scope() === 'mios' ? a.propio : a.estado === 'PENDIENTE')) &&
        (!this.estado() || a.estado === this.estado()),
    ),
  );

  protected readonly resumen = computed(() => {
    const todos = this.avisos();
    const mios = todos.filter((a) => a.propio);
    const contar = (lista: Aviso[], e: EstadoAviso) => lista.filter((a) => a.estado === e).length;
    return {
      pendientes: contar(todos, 'PENDIENTE'),
      enRevision: contar(todos, 'EN_REVISION'),
      resueltos: contar(todos, 'RESUELTO'),
      misPendientes: contar(mios, 'PENDIENTE'),
      misEnRevision: contar(mios, 'EN_REVISION'),
      misResueltos: contar(mios, 'RESUELTO'),
    };
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.client.getAllAvisos().subscribe({
      next: (data) => {
        this.avisos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  irANuevo() {
    this.router.navigate(ROUTE_COMMANDS.nuevoAviso);
  }

  irAEditar(a: Aviso) {
    if (a.estado === 'PENDIENTE') {
      this.router.navigate(ROUTE_COMMANDS.editarAviso(a.id));
    }
  }

  cambiarEstado(a: Aviso, estado: string) {
    const nuevoEstado = estado as EstadoAviso;
    if (!this.auth.isAdmin() || nuevoEstado === a.estado) return;
    this.error.set('');
    this.client.cambiarEstado(a.id, nuevoEstado).subscribe({
      next: () => {
        this.notificationService.show(`Aviso marcado como ${ESTADOS[nuevoEstado].toLowerCase()}.`);
        this.load();
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.load();
      },
    });
  }

  async eliminar(a: Aviso) {
    if (a.estado !== 'RESUELTO' || !this.auth.isAdmin()) return;

    const confirmed = await this.confirmationService.requestConfirmation(
      `¿Seguro que deseás eliminar el aviso de "${a.aulaNombre}"?`,
    );
    if (!confirmed) return;

    this.client.deleteAviso(a.id).subscribe({
      next: () => {
        this.notificationService.show('Aviso eliminado.');
        this.load();
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
