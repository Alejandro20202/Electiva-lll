import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-estadisticas',
  template: `
    <section class="page-view" aria-labelledby="page-heading">
      <span class="page-eyebrow">TU ESPACIO ACADÉMICO</span>
      <h2 id="page-heading">Estadísticas</h2>
      <p>Un espacio para conocer tu seguimiento y progreso académico.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Estadisticas {}
