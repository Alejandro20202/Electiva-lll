import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EduTrackService } from '../../services/edutrack.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('shows live summary cards, per-subject progress, and upcoming tasks', () => {
    const service = TestBed.inject(EduTrackService);
    const materia = service.createMateria({
      nombre: 'Biología',
      color: 'verde',
    });
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const dueDate = tomorrow.toISOString().slice(0, 10);

    service.createTarea({
      titulo: 'Informe de laboratorio',
      materiaId: materia.id,
      fechaEntrega: dueDate,
    });
    service.createTarea({
      titulo: 'Cuestionario',
      materiaId: materia.id,
      estado: 'completada',
    });
    service.createTarea({ titulo: 'Lectura vencida', fechaEntrega: '2000-01-01' });

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.stat-card--subjects .stat-value')?.textContent?.trim()).toBe(
      '1',
    );
    expect(element.querySelector('.stat-card--pending .stat-value')?.textContent?.trim()).toBe(
      '2',
    );
    expect(
      element.querySelector('.stat-card--completed .stat-value')?.textContent?.trim(),
    ).toBe('1');
    expect(element.querySelector('.stat-card--progress .stat-value')?.textContent?.trim()).toBe(
      '33%',
    );
    expect(element.querySelector('.progress-fill')?.getAttribute('style')).toContain(
      'width: 50%',
    );
    expect(element.querySelector('.deadline-list')?.textContent).toContain(
      'Informe de laboratorio',
    );
    expect(element.querySelector('.deadline-list')?.textContent).not.toContain('Lectura vencida');
  });

  it('shows empty states when the student has no subjects or upcoming deliveries', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.panel-empty')).toHaveLength(2);
    expect(element.querySelector('.stat-card--progress .stat-value')?.textContent?.trim()).toBe(
      '0%',
    );
  });
});
