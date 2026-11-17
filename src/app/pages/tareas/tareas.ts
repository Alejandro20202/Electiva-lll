import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tareas',
  template: `
    <section class="page-view" aria-labelledby="page-heading">
      <span class="page-eyebrow">TU ESPACIO ACADÉMICO</span>
      <h2 id="page-heading">Tareas</h2>
      <p>Un lugar para mantener tus tareas académicas organizadas.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tareas {}
