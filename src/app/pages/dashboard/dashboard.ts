import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MateriaColor } from '../../models/materia.model';
import { Tarea } from '../../models/tarea.model';
import { EduTrackService } from '../../services/edutrack.service';

interface MateriaProgreso {
  id: string;
  nombre: string;
  color: MateriaColor;
  total: number;
  completadas: number;
  porcentaje: number;
}

interface ProximaEntrega {
  tarea: Tarea;
  materiaNombre: string;
  materiaColor: MateriaColor | null;
  fechaTexto: string;
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDueDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

function hasUpcomingDueDate(
  tarea: Tarea,
  today: string,
): tarea is Tarea & { fechaEntrega: string } {
  if (
    tarea.estado !== 'pendiente' ||
    tarea.fechaEntrega === null ||
    !/^\d{4}-\d{2}-\d{2}$/.test(tarea.fechaEntrega) ||
    tarea.fechaEntrega < today
  ) {
    return false;
  }

  const [year, month, day] = tarea.fechaEntrega.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly eduTrack = inject(EduTrackService);

  private readonly hoy = utcDateKey(new Date());

  protected readonly materiasProgreso = computed<MateriaProgreso[]>(() => {
    const tareas = this.eduTrack.tareas();

    return this.eduTrack.materias().map((materia) => {
      const materiaTareas = tareas.filter((tarea) => tarea.materiaId === materia.id);
      const completadas = materiaTareas.filter(
        (tarea) => tarea.estado === 'completada',
      ).length;

      return {
        id: materia.id,
        nombre: materia.nombre,
        color: materia.color,
        total: materiaTareas.length,
        completadas,
        porcentaje:
          materiaTareas.length === 0
            ? 0
            : Math.round((completadas / materiaTareas.length) * 100),
      };
    });
  });

  protected readonly proximasEntregas = computed<ProximaEntrega[]>(() => {
    const materias = new Map(
      this.eduTrack.materias().map((materia) => [materia.id, materia]),
    );

    return this.eduTrack
      .tareas()
      .filter((tarea) => hasUpcomingDueDate(tarea, this.hoy))
      .sort((left, right) => left.fechaEntrega.localeCompare(right.fechaEntrega))
      .slice(0, 5)
      .map((tarea) => {
        const materia =
          tarea.materiaId === null ? undefined : materias.get(tarea.materiaId);
        return {
          tarea,
          materiaNombre: materia?.nombre ?? 'Sin materia',
          materiaColor: materia?.color ?? null,
          fechaTexto:
            tarea.fechaEntrega === this.hoy
              ? 'Hoy'
              : formatDueDate(tarea.fechaEntrega),
        };
      });
  });
}
