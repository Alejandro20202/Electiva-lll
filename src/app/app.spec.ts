import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the dashboard and primary navigation', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/dashboard');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard');
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('EduTrack');
    expect(compiled.querySelectorAll('nav a')).toHaveLength(5);
  });

  it('should update the page title and active link for every section', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const sections = [
      ['/dashboard', 'Dashboard'],
      ['/materias', 'Materias'],
      ['/tareas', 'Tareas'],
      ['/calendario', 'Calendario'],
      ['/estadisticas', 'Estadísticas'],
    ] as const;

    fixture.detectChanges();

    for (const [path, title] of sections) {
      await router.navigateByUrl(path);
      await fixture.whenStable();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent?.trim()).toBe(title);
      expect(
        compiled.querySelector('nav a[aria-current="page"]')?.textContent?.trim(),
      ).toBe(title);
    }
  });
});
