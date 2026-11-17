import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Materia } from '../../models/materia.model';
import { PrioridadTarea } from '../../models/tarea.model';
import { EduTrackService } from '../../services/edutrack.service';

interface MateriaStats {
  materia: Materia;
  total: number;
  pendientes: number;
  completadas: number;
  porcentaje: number;
}

@Component({
  selector: 'app-estadisticas',
  imports: [RouterLink],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Estadisticas {
  protected readonly eduTrack = inject(EduTrackService);

  protected readonly tareasPorMateria = computed<MateriaStats[]>(() => {
    const tareas = this.eduTrack.tareas();
    return this.eduTrack.materias().map((materia) => {
      const propias = tareas.filter((tarea) => tarea.materiaId === materia.id);
      const completadas = propias.filter((tarea) => tarea.estado === 'completada').length;
      return {
        materia,
        total: propias.length,
        pendientes: propias.length - completadas,
        completadas,
        porcentaje: propias.length === 0 ? 0 : Math.round((completadas / propias.length) * 100),
      };
    }).sort((a, b) => b.total - a.total || a.materia.nombre.localeCompare(b.materia.nombre));
  });

  protected readonly tareasSinMateria = computed(() =>
    this.eduTrack.tareas().filter((tarea) => tarea.materiaId === null).length,
  );

  protected readonly prioridades = computed(() => {
    const tareas = this.eduTrack.tareas();
    return (['alta', 'media', 'baja'] as PrioridadTarea[]).map((prioridad) => ({
      prioridad,
      total: tareas.filter((tarea) => tarea.prioridad === prioridad).length,
      porcentaje: tareas.length === 0 ? 0 : Math.round((tareas.filter((tarea) => tarea.prioridad === prioridad).length / tareas.length) * 100),
    }));
  });

  protected prioridadTexto(prioridad: PrioridadTarea): string {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
  }
}
