import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-list-status',
  templateUrl: './list-status.html',
  styleUrl: './list-status.css',
})
export class ListStatus {
  readonly loading = input(false);
  readonly error = input('');
  readonly count = input(0);
  readonly retry = output<void>();
}
