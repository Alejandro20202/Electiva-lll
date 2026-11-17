import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-calendario',
  template: `
    <section class="page-view" aria-labelledby="page-heading">
      <span class="page-eyebrow">TU ESPACIO ACADÉMICO</span>
      <h2 id="page-heading">Calendario</h2>
      <p>Visualiza en un mismo espacio la organización de tu tiempo académico.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendario {}
