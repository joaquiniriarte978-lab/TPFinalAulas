import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioClient } from '../../data-access/usuario-client';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Rol, ROLES, Usuario } from '../../data-access/usuario';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/confirmation.service';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-usuario-list',
  styleUrl: './usuario-list.css',
  templateUrl: './usuario-list.html',
})
export default class UsuarioList implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(UsuarioClient);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly roles = ROLES;
  protected readonly roleKeys: Rol[] = ['ADMIN', 'PROFESOR', 'ALUMNO'];
  protected readonly query = signal('');
  protected readonly rol = signal('');

  protected readonly filtered = computed(() =>
    this.usuarios().filter(
      (u) =>
        `${u.nombre} ${u.email}`.toLowerCase().includes(this.query().toLowerCase()) &&
        (!this.rol() || u.rol === this.rol()),
    ),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.client.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  isSelf(user: Usuario | null) {
    return user?.id != null && user.id === this.auth.user()?.id;
  }

  isOtherAdmin(user: Usuario | null) {
    return user?.rol === 'ADMIN' && !this.isSelf(user);
  }

  clear() {
    this.query.set('');
    this.rol.set('');
  }

  irANuevo() {
    this.router.navigate(ROUTE_COMMANDS.nuevoUsuario);
  }

  irAEditar(user: Usuario) {
    if (user.id != null && !this.isOtherAdmin(user)) {
      this.router.navigate(ROUTE_COMMANDS.editarUsuario(user.id));
    }
  }

  async eliminar(user: Usuario) {
    if (user.id == null || this.isSelf(user) || this.isOtherAdmin(user)) return;

    const confirmed = await this.confirmationService.requestConfirmation(
      `¿Seguro que deseás eliminar la cuenta de "${user.nombre}" (${user.email})?`,
    );
    if (!confirmed) return;

    this.client.deleteUsuario(user.id).subscribe({
      next: () => {
        this.notificationService.show('Usuario eliminado correctamente.');
        this.load();
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
