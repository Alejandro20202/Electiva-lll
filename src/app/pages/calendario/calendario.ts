import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoTarea, PrioridadTarea, Tarea } from '../../models/tarea.model';
import { Materia } from '../../models/materia.model';
import { EduTrackService } from '../../services/edutrack.service';

interface AgendaItem {
  tarea: Tarea;
  materia: Materia | undefined;
  fechaTexto: string;
  tipo: 'vencida' | 'proxima' | 'completada' | 'sin-fecha';
}

interface AgendaGroup {
  key: string;
  titulo: string;
  subtitulo: string;
  items: AgendaItem[];
}

@Component({
  selector: 'app-calendario',
  imports: [RouterLink],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendario {
  protected readonly eduTrack = inject(EduTrackService);

  protected readonly agenda = computed<AgendaGroup[]>(() => {
    const grupos = new Map<string, AgendaGroup>();
    const hoy = this.dateKey(new Date());

    for (const tarea of this.eduTrack.tareas()) {
      const key = tarea.fechaEntrega ?? 'sin-fecha';
      const item: AgendaItem = {
        tarea,
        materia: tarea.materiaId ? this.eduTrack.getMateria(tarea.materiaId) : undefined,
        fechaTexto: tarea.fechaEntrega ? this.formatDate(tarea.fechaEntrega) : 'Sin fecha de entrega',
        tipo: this.itemType(tarea, hoy),
      };

      const grupo = grupos.get(key) ?? {
        key,
        titulo: tarea.fechaEntrega ? this.relativeDate(tarea.fechaEntrega, hoy) : 'Sin fecha asignada',
        subtitulo: tarea.fechaEntrega ? this.formatDate(tarea.fechaEntrega) : 'Estas tareas necesitan una fecha de entrega',
        items: [],
      };
      grupo.items.push(item);
      grupos.set(key, grupo);
    }

    return [...grupos.values()].sort((a, b) => {
      if (a.key === 'sin-fecha') return 1;
      if (b.key === 'sin-fecha') return -1;
      return a.key.localeCompare(b.key);
    });
  });

  protected readonly tareasProximas = computed(() =>
    this.eduTrack.tareas().filter((tarea) => this.itemType(tarea, this.dateKey(new Date())) === 'proxima').length,
  );

  protected readonly tareasVencidas = computed(() =>
    this.eduTrack.tareas().filter((tarea) => this.itemType(tarea, this.dateKey(new Date())) === 'vencida').length,
  );

  protected prioridadTexto(prioridad: PrioridadTarea): string {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
  }

  protected estadoTexto(estado: EstadoTarea): string {
    return estado === 'completada' ? 'Completada' : 'Pendiente';
  }

  protected tipoTexto(tipo: AgendaItem['tipo']): string {
    if (tipo === 'vencida') return 'Vencida';
    if (tipo === 'completada') return 'Completada';
    if (tipo === 'sin-fecha') return 'Sin fecha';
    return 'Próxima';
  }

  private itemType(tarea: Tarea, hoy: string): AgendaItem['tipo'] {
    if (tarea.estado === 'completada') return 'completada';
    if (!tarea.fechaEntrega) return 'sin-fecha';
    return tarea.fechaEntrega < hoy ? 'vencida' : 'proxima';
  }

  private relativeDate(fecha: string, hoy: string): string {
    if (fecha === hoy) return 'Hoy';
    const manana = this.addDays(hoy, 1);
    if (fecha === manana) return 'Mañana';
    const ayer = this.addDays(hoy, -1);
    if (fecha === ayer) return 'Ayer';
    return this.formatDate(fecha);
  }

  private formatDate(fecha: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${fecha}T00:00:00`));
  }

  private dateKey(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addDays(key: string, days: number): string {
    const date = new Date(`${key}T00:00:00`);
    date.setDate(date.getDate() + days);
    return this.dateKey(date);
  }
}
