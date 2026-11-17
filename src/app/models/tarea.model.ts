export type EstadoTarea = 'pendiente' | 'completada';
export type PrioridadTarea = 'baja' | 'media' | 'alta';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  materiaId: string | null;
  fechaEntrega: string | null;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  createdAt: string;
}

export type NuevaTarea = Pick<Tarea, 'titulo'> &
  Partial<
    Pick<
      Tarea,
      | 'descripcion'
      | 'materiaId'
      | 'fechaEntrega'
      | 'estado'
      | 'prioridad'
    >
  >;
