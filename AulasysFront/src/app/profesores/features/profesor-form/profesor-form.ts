import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfesorClient } from '../../data-access/profesor-client';
import { MateriaClient } from '../../../materias/data-access/materia-client';
import { Profesor } from '../../data-access/profesor';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { NotificationService } from '../../../shared/notification.service';
import { mensajeError } from '../../../shared/error-message';

@Component({
  imports: [],
  selector: 'app-profesor-form',
  styleUrl: './profesor-form.css',
  templateUrl: './profesor-form.html',
})
export default class ProfesorForm implements OnInit {
  private readonly client = inject(ProfesorClient);
  private readonly materiaClient = inject(MateriaClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly profesor = signal<Profesor | null>(null);
  protected readonly materias = toSignal(this.materiaClient.getAllMaterias(), {
    initialValue: [],
  });
  protected readonly selected = signal<number[]>([]);
  protected readonly error = signal('');
  protected readonly submitting = signal(false);

  ngOnInit() {
    if (this.id) {
      this.client.getAllProfesores().subscribe({
        next: (list) => {
          const found = list.find((p) => String(p.id) === this.id) ?? null;
          this.profesor.set(found);
          if (found) {
            this.selected.set([...found.materiasIds]);
          } else {
            this.error.set('Profesor no encontrado.');
          }
        },
        error: (err) => this.error.set(mensajeError(err)),
      });
    }
  }

  toggle(id: number) {
    this.selected.update((v) => (v.includes(id) ? v.filter((i) => i !== id) : [...v, id]));
  }

  guardar() {
    if (!this.id || this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');
    this.client.editMaterias(this.selected(), this.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notificationService.show('Asignaciones actualizadas.');
        this.router.navigate(ROUTE_COMMANDS.profesores);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(mensajeError(err));
      },
    });
  }

  cancelar() {
    this.router.navigate(ROUTE_COMMANDS.profesores);
  }
}
