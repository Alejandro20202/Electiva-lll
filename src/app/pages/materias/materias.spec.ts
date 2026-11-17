import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EduTrackService } from '../../services/edutrack.service';
import { Materias } from './materias';

describe('Materias', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materias],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();
  });

  it('creates, edits, lists, and deletes materias with their task count', () => {
    const service = TestBed.inject(EduTrackService);
    const materia = service.createMateria({
      nombre: 'Matemáticas',
      profesor: 'Ana Pérez',
      color: 'violeta',
    });
    service.createTarea({ titulo: 'Ejercicios', materiaId: materia.id });
    service.createTarea({ titulo: 'Repaso', materiaId: materia.id });

    const fixture = TestBed.createComponent(Materias);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector(
      '.subject-card',
    ) as HTMLElement;
    expect(card.querySelector('h4')?.textContent?.trim()).toBe('Matemáticas');
    expect(card.querySelector('.task-count')?.textContent).toContain(
      '2 tareas asociadas',
    );
    expect(card.classList.contains('subject-card--violeta')).toBe(true);

    (card.querySelector('.subject-actions .secondary-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const nameInput = fixture.nativeElement.querySelector(
      '#subject-name',
    ) as HTMLInputElement;
    expect(nameInput.value).toBe('Matemáticas');

    nameInput.value = 'Álgebra';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '.form-actions .primary-button',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(service.getMateria(materia.id)?.nombre).toBe('Álgebra');
    expect(fixture.nativeElement.querySelector('.subject-card h4')?.textContent?.trim()).toBe(
      'Álgebra',
    );

    (
      fixture.nativeElement.querySelector(
        '.subject-actions .danger-button',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.delete-confirmation')?.textContent).toContain(
      'También se eliminarán sus 2 tareas asociadas.',
    );

    (
      fixture.nativeElement.querySelector(
        '.delete-confirmation .danger-button',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(service.materias()).toEqual([]);
    expect(service.tareas()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('requires a non-blank name before creating a materia', () => {
    const service = TestBed.inject(EduTrackService);
    const fixture = TestBed.createComponent(Materias);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.page-heading .primary-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector(
        '.form-actions .primary-button',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(service.materias()).toEqual([]);
    expect(fixture.nativeElement.querySelector('#subject-name-error')?.textContent).toContain(
      'Escribe el nombre de la materia.',
    );
  });
});
