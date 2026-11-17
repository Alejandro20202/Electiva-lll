import {
  afterNextRender,
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  DEFAULT_MATERIA_COLOR,
  MATERIA_COLORS,
  Materia,
  MateriaColor,
  NuevaMateria,
} from '../models/materia.model';
import { NuevaTarea, Tarea } from '../models/tarea.model';

const STORAGE_KEY = 'edutrack-data';
const STORAGE_VERSION = 1;

interface PersistedState {
  version: number;
  materias: Materia[];
  tareas: Tarea[];
}

type StoredMateria = Omit<Materia, 'color'> & { color?: MateriaColor };

interface StoredState {
  version: number;
  materias: StoredMateria[];
  tareas: Tarea[];
}

const isMateriaColor = (value: unknown): value is MateriaColor =>
  MATERIA_COLORS.some((color) => color.name === value);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMateria(value: unknown): value is StoredMateria {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['nombre'] === 'string' &&
    typeof value['descripcion'] === 'string' &&
    typeof value['profesor'] === 'string' &&
    (value['color'] === undefined || isMateriaColor(value['color'])) &&
    typeof value['createdAt'] === 'string'
  );
}

function isTarea(value: unknown): value is Tarea {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['titulo'] === 'string' &&
    typeof value['descripcion'] === 'string' &&
    (typeof value['materiaId'] === 'string' || value['materiaId'] === null) &&
    (typeof value['fechaEntrega'] === 'string' || value['fechaEntrega'] === null) &&
    (value['estado'] === 'pendiente' || value['estado'] === 'completada') &&
    (value['prioridad'] === 'baja' ||
      value['prioridad'] === 'media' ||
      value['prioridad'] === 'alta') &&
    typeof value['createdAt'] === 'string'
  );
}

function isStoredState(value: unknown): value is StoredState {
  return (
    isRecord(value) &&
    value['version'] === STORAGE_VERSION &&
    Array.isArray(value['materias']) &&
    value['materias'].every(isMateria) &&
    Array.isArray(value['tareas']) &&
    value['tareas'].every(isTarea)
  );
}

@Injectable({ providedIn: 'root' })
export class EduTrackService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private storageInitialized = !this.browser;

  private readonly materiasState = signal<Materia[]>([]);
  private readonly tareasState = signal<Tarea[]>([]);

  readonly materias = this.materiasState.asReadonly();
  readonly tareas = this.tareasState.asReadonly();

  readonly totalMaterias = computed(() => this.materias().length);
  readonly totalTareas = computed(() => this.tareas().length);
  readonly tareasPendientes = computed(
    () => this.tareas().filter((tarea) => tarea.estado === 'pendiente').length,
  );
  readonly tareasCompletadas = computed(
    () => this.tareas().filter((tarea) => tarea.estado === 'completada').length,
  );
  readonly porcentajeTareasCompletadas = computed(() => {
    const total = this.totalTareas();
    return total === 0 ? 0 : Math.round((this.tareasCompletadas() / total) * 100);
  });

  constructor() {
    if (this.browser) {
      afterNextRender(() => this.restoreFromStorage());
    }
  }

  getMateria(id: string): Materia | undefined {
    return this.materias().find((materia) => materia.id === id);
  }

  createMateria(input: NuevaMateria): Materia {
    this.ensureStorageInitialized();
    const materia: Materia = {
      id: this.createId(),
      nombre: input.nombre,
      descripcion: input.descripcion ?? '',
      profesor: input.profesor ?? '',
      color: input.color ?? DEFAULT_MATERIA_COLOR,
      createdAt: new Date().toISOString(),
    };
    const materias = [...this.materias(), materia];
    this.commit({ materias, tareas: this.tareas() });
    return materia;
  }

  updateMateria(id: string, changes: Partial<NuevaMateria>): Materia {
    this.ensureStorageInitialized();
    const current = this.getMateria(id);
    if (!current) {
      throw new Error(`No existe una materia con el id "${id}".`);
    }

    const updated: Materia = { ...current, ...changes };
    const materias = this.materias().map((materia) =>
      materia.id === id ? updated : materia,
    );
    this.commit({ materias, tareas: this.tareas() });
    return updated;
  }

  deleteMateria(id: string): void {
    this.ensureStorageInitialized();
    if (!this.getMateria(id)) {
      throw new Error(`No existe una materia con el id "${id}".`);
    }

    this.commit({
      materias: this.materias().filter((materia) => materia.id !== id),
      tareas: this.tareas().filter((tarea) => tarea.materiaId !== id),
    });
  }

  getTarea(id: string): Tarea | undefined {
    return this.tareas().find((tarea) => tarea.id === id);
  }

  createTarea(input: NuevaTarea): Tarea {
    this.ensureStorageInitialized();
    this.validateMateria(input.materiaId ?? null);
    const tarea: Tarea = {
      id: this.createId(),
      titulo: input.titulo,
      descripcion: input.descripcion ?? '',
      materiaId: input.materiaId ?? null,
      fechaEntrega: input.fechaEntrega ?? null,
      estado: input.estado ?? 'pendiente',
      prioridad: input.prioridad ?? 'media',
      createdAt: new Date().toISOString(),
    };
    this.commit({ materias: this.materias(), tareas: [...this.tareas(), tarea] });
    return tarea;
  }

  updateTarea(id: string, changes: Partial<NuevaTarea>): Tarea {
    this.ensureStorageInitialized();
    const current = this.getTarea(id);
    if (!current) {
      throw new Error(`No existe una tarea con el id "${id}".`);
    }
    this.validateMateria(changes.materiaId ?? current.materiaId);

    const updated = { ...current, ...changes };
    const tareas = this.tareas().map((tarea) => (tarea.id === id ? updated : tarea));
    this.commit({ materias: this.materias(), tareas });
    return updated;
  }

  deleteTarea(id: string): void {
    this.ensureStorageInitialized();
    if (!this.getTarea(id)) {
      throw new Error(`No existe una tarea con el id "${id}".`);
    }

    this.commit({
      materias: this.materias(),
      tareas: this.tareas().filter((tarea) => tarea.id !== id),
    });
  }

  private validateMateria(materiaId: string | null): void {
    if (materiaId !== null && !this.getMateria(materiaId)) {
      throw new Error(`No existe una materia con el id "${materiaId}".`);
    }
  }

  private ensureStorageInitialized(): void {
    if (this.browser && !this.storageInitialized) {
      this.restoreFromStorage();
    }
  }

  private restoreFromStorage(): void {
    if (this.storageInitialized) {
      return;
    }
    this.storageInitialized = true;

    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('EduTrack no pudo leer los datos de Local Storage.', error);
      return;
    }

    if (raw === null) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error('EduTrack encontró datos JSON inválidos en Local Storage.', error);
      return;
    }

    if (!isStoredState(parsed)) {
      console.error('EduTrack encontró datos con un formato o versión no compatible.');
      return;
    }

    this.materiasState.set(
      parsed.materias.map((materia) => ({
        ...materia,
        color: materia.color ?? DEFAULT_MATERIA_COLOR,
      })),
    );
    this.tareasState.set(parsed.tareas);
  }

  private commit(state: Pick<PersistedState, 'materias' | 'tareas'>): void {
    if (this.browser) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: STORAGE_VERSION, ...state } satisfies PersistedState),
        );
      } catch (error) {
        console.error('EduTrack no pudo guardar los cambios en Local Storage.', error);
        throw new Error('No se pudieron guardar los cambios de EduTrack.', {
          cause: error,
        });
      }
    }

    this.materiasState.set(state.materias);
    this.tareasState.set(state.tareas);
  }

  private createId(): string {
    return globalThis.crypto.randomUUID();
  }
}
