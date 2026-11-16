import { afterRenderEffect, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

const CONTROLS = ['INPUT', 'SELECT', 'TEXTAREA'];
let nextId = 0;

@Component({
  imports: [],
  selector: 'app-field-error',
  styleUrl: './field-error.css',
  templateUrl: './field-error.html',
})
export class FieldError {
  public readonly field = input.required<FieldTree<unknown>>();
  protected readonly id = `field-error-${++nextId}`;
  protected readonly visible = computed(
    () => this.field()().touched() && this.field()().invalid(),
  );
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Conecta el mensaje con su control (aria-invalid y aria-describedby) sin tocar cada formulario.
    afterRenderEffect({
      write: (onCleanup) => {
        const control = this.control();
        if (!control || !this.visible()) return;
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', this.tokens(control).concat(this.id).join(' '));
        onCleanup(() => {
          control.removeAttribute('aria-invalid');
          const rest = this.tokens(control).filter((token) => token !== this.id);
          if (rest.length) control.setAttribute('aria-describedby', rest.join(' '));
          else control.removeAttribute('aria-describedby');
        });
      },
    });
  }

  /** El control que el mensaje acompaña: el input/select/textarea anterior más cercano. */
  private control(): HTMLElement | null {
    let element = this.host.nativeElement.previousElementSibling;
    for (let steps = 0; element && steps < 4; steps++) {
      if (CONTROLS.includes(element.tagName)) return element as HTMLElement;
      element = element.previousElementSibling;
    }
    return null;
  }

  private tokens(control: HTMLElement): string[] {
    return (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  }
}
