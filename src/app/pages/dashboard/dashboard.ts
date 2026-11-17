import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <section class="page-view" aria-labelledby="page-heading">
      <span class="page-eyebrow">TU ESPACIO ACADÉMICO</span>
      <h2 id="page-heading">Dashboard</h2>
      <p>Un espacio para organizar y dar seguimiento a tu vida académica.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
