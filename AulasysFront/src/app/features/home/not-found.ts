import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<section class="empty-state">
    <h1>No encontramos esta página</h1>
    <p>Revisá la dirección o elegí una sección del menú.</p>
    <a class="button primary" routerLink="/aulas">Volver a aulas</a>
  </section>`,
})
export class NotFound {}
