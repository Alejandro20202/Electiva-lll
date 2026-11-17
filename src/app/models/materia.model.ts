export interface Materia {
  id: string;
  nombre: string;
  descripcion: string;
  profesor: string;
  createdAt: string;
}

export type NuevaMateria = Pick<Materia, 'nombre'> &
  Partial<Pick<Materia, 'descripcion' | 'profesor'>>;
