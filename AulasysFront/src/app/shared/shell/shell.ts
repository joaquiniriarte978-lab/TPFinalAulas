import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { ROLES } from '../../usuarios/data-access/usuario';
import { ROUTE_COMMANDS } from '../../app.route.segments';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly commands = ROUTE_COMMANDS;
  protected readonly roles = ROLES;
  protected readonly menuOpen = signal(false);
}
