export const MATERIA_COLORS = [
  { name: 'azul', label: 'Azul' },
  { name: 'violeta', label: 'Violeta' },
  { name: 'verde', label: 'Verde' },
  { name: 'coral', label: 'Coral' },
  { name: 'ambar', label: 'Ámbar' },
  { name: 'turquesa', label: 'Turquesa' },
] as const;

export type MateriaColor = (typeof MATERIA_COLORS)[number]['name'];

export interface Materia {
  id: string;
  nombre: string;
  descripcion: string;
  profesor: string;
  color: MateriaColor;
  createdAt: string;
}

export type NuevaMateria = Pick<Materia, 'nombre'> &
  Partial<Pick<Materia, 'descripcion' | 'profesor' | 'color'>>;

export const DEFAULT_MATERIA_COLOR: MateriaColor = 'azul';
