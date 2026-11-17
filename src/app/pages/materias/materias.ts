import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-materias',
  template: `
    <section class="page-view" aria-labelledby="page-heading">
      <span class="page-eyebrow">TU ESPACIO ACADÉMICO</span>
      <h2 id="page-heading">Materias</h2>
      <p>Consulta y organiza tus materias en un solo lugar.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Materias {}
