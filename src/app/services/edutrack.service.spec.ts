import { Component, inject, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EduTrackService } from './edutrack.service';

@Component({ template: '' })
class ServiceHost {
  readonly service = inject(EduTrackService);
}

describe('EduTrackService', () => {
  let service: EduTrackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    service = TestBed.inject(EduTrackService);
  });

  it('creates, updates, and deletes materias and tareas', () => {
    const materia = service.createMateria({ nombre: 'Matemáticas' });
    const tarea = service.createTarea({
      titulo: 'Resolver ejercicios',
      materiaId: materia.id,
    });

    expect(service.getMateria(materia.id)?.nombre).toBe('Matemáticas');
    expect(service.getTarea(tarea.id)?.materiaId).toBe(materia.id);

    service.updateMateria(materia.id, { nombre: 'Álgebra' });
    service.updateTarea(tarea.id, { estado: 'completada' });

    expect(service.getMateria(materia.id)?.nombre).toBe('Álgebra');
    expect(service.getTarea(tarea.id)?.estado).toBe('completada');

    service.deleteTarea(tarea.id);
    service.deleteMateria(materia.id);

    expect(service.materias()).toEqual([]);
    expect(service.tareas()).toEqual([]);
  });

  it('computes task statistics from signals', () => {
    service.createTarea({ titulo: 'Pendiente' });
    service.createTarea({ titulo: 'Terminada', estado: 'completada' });

    expect(service.totalMaterias()).toBe(0);
    expect(service.totalTareas()).toBe(2);
    expect(service.tareasPendientes()).toBe(1);
    expect(service.tareasCompletadas()).toBe(1);
    expect(service.porcentajeTareasCompletadas()).toBe(50);
  });

  it('deletes the tasks linked to a deleted materia', () => {
    const materia = service.createMateria({ nombre: 'Historia' });
    service.createTarea({ titulo: 'Lectura', materiaId: materia.id });
    service.createTarea({ titulo: 'Tarea sin materia' });

    service.deleteMateria(materia.id);

    expect(service.tareas().map((tarea) => tarea.titulo)).toEqual([
      'Tarea sin materia',
    ]);
  });

  it('does not access Local Storage while running on the server', () => {
    expect(() => service.createMateria({ nombre: 'Ciencias' })).not.toThrow();
    expect(service.totalMaterias()).toBe(1);
  });

  it('rejects tareas that reference an unknown materia', () => {
    expect(() =>
      service.createTarea({ titulo: 'Sin materia válida', materiaId: 'missing' }),
    ).toThrow('No existe una materia con el id "missing".');
  });
});

describe('EduTrackService browser persistence', () => {
  const storageKey = 'edutrack-data';

  afterEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.resetTestingModule();
  });

  it('restores persisted data after the first render and persists changes', async () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        materias: [
          {
            id: 'materia-1',
            nombre: 'Biología',
            descripcion: '',
            profesor: '',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        tareas: [],
      }),
    );
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });

    const fixture = TestBed.createComponent(ServiceHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const service = fixture.componentInstance.service;
    expect(service.materias().map((materia) => materia.nombre)).toEqual(['Biología']);

    service.createTarea({ titulo: 'Informe' });

    const stored = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as {
      tareas: { titulo: string }[];
    };
    expect(stored.tareas.map((tarea) => tarea.titulo)).toEqual(['Informe']);
  });
});
