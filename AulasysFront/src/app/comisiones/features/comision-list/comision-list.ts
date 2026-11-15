import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ComisionClient } from '../../data-access/comision-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Comision } from '../../data-access/comision';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-comision-list',
  styleUrl: './comision-list.css',
  templateUrl: './comision-list.html',
})
export default class ComisionList implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(ComisionClient);
  private readonly router = inject(Router);

  protected readonly comisiones = signal<Comision[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly query = signal('');

  protected readonly filtered = computed(() =>
    this.comisiones().filter((c) =>
      `${c.materiaNombre} ${c.profesorNombre} ${c.id}`
        .toLowerCase()
        .includes(this.query().toLowerCase()),
    ),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    const request$ = this.auth.isAdmin()
      ? this.client.getAllComisiones()
      : this.client.getMisComisiones();

    request$.subscribe({
      next: (data) => {
        this.comisiones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  irANueva() {
    this.router.navigate(ROUTE_COMMANDS.nuevaComision);
  }

  irADetalle(c: Comision) {
    this.router.navigate(ROUTE_COMMANDS.detalleComision(c.id));
  }
}
