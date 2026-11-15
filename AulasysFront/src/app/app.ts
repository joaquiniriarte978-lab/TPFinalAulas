import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService } from './shared/confirmation.service';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { NotificationHost } from './shared/notification-host/notification-host';

@Component({
  imports: [RouterOutlet, ConfirmDialog, NotificationHost],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly confirmationService = inject(ConfirmationService);
}
