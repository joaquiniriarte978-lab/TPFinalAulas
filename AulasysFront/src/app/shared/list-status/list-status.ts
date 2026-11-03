import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-list-status',
  styleUrl: './list-status.css',
  templateUrl: './list-status.html',
})
export class ListStatus {
  public readonly loading = input(false);
  public readonly error = input('');
  public readonly count = input(0);
  public readonly retry = output<void>();
}
