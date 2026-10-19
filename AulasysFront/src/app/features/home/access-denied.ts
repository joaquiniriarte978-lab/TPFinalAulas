import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-access-denied',
  imports: [RouterLink],
  template: `<section class="empty-state">
    <h1>Esta sección es para administradores</h1>
    <p>Tu cuenta puede consultar aulas y materias desde el menú.</p>
    <a class="button primary" routerLink="/aulas">Volver a aulas</a>
  </section>`,
})
export class AccessDenied {}
