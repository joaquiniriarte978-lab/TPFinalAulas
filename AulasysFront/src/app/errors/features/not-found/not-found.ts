import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [RouterLink],
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export default class NotFound {
  protected readonly commands = ROUTE_COMMANDS;
}
