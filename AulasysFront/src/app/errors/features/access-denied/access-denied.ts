import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [RouterLink],
  selector: 'app-access-denied',
  styleUrl: './access-denied.css',
  templateUrl: './access-denied.html',
})
export default class AccessDenied {
  protected readonly commands = ROUTE_COMMANDS;
}
