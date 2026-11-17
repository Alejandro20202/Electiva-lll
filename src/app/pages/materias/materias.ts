import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import {
  DEFAULT_MATERIA_COLOR,
  MATERIA_COLORS,
  Materia,
  MateriaColor,
} from '../../models/materia.model';
import { EduTrackService } from '../../services/edutrack.service';

@Component({
  selector: 'app-materias',
  imports: [ReactiveFormsModule],
  templateUrl: './materias.html',
  styleUrl: './materias.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Materias {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  protected readonly eduTrack = inject(EduTrackService);

  protected readonly colores = MATERIA_COLORS;
  protected readonly formularioVisible = signal(false);
  protected readonly enviado = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly confirmarEliminacionId = signal<string | null>(null);
  protected readonly errorMessage = signal('');

  protected readonly tareasPorMateria = computed(() => {
    const counts = new Map<string, number>();
    for (const tarea of this.eduTrack.tareas()) {
      if (tarea.materiaId) {
        counts.set(tarea.materiaId, (counts.get(tarea.materiaId) ?? 0) + 1);
      }
    }
    return counts;
  });

  private readonly nonBlankValidator: ValidatorFn = (control) =>
    typeof control.value === 'string' && control.value.trim().length > 0
      ? null
      : { blank: true };

  protected readonly materiaForm = this.formBuilder.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.maxLength(70),
        this.nonBlankValidator,
      ],
    ],
    profesor: ['', [Validators.maxLength(80)]],
    descripcion: ['', [Validators.maxLength(240)]],
    color: [DEFAULT_MATERIA_COLOR],
  });

  protected guardarMateria(): void {
    this.enviado.set(true);
    this.errorMessage.set('');

    if (this.materiaForm.invalid) {
      this.materiaForm.markAllAsTouched();
      return;
    }

    const { nombre, profesor, descripcion, color } = this.materiaForm.getRawValue();
    const changes = {
      nombre: nombre.trim(),
      profesor: profesor.trim(),
      descripcion: descripcion.trim(),
      color,
    };

    try {
      const id = this.editandoId();
      if (id) {
        this.eduTrack.updateMateria(id, changes);
      } else {
        this.eduTrack.createMateria(changes);
      }
      this.cancelarFormulario();
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No se pudo guardar la materia.',
      );
    }
  }

  protected abrirNuevaMateria(): void {
    this.resetForm();
    this.editandoId.set(null);
    this.confirmarEliminacionId.set(null);
    this.errorMessage.set('');
    this.formularioVisible.set(true);
  }

  protected editarMateria(materia: Materia): void {
    this.confirmarEliminacionId.set(null);
    this.errorMessage.set('');
    this.editandoId.set(materia.id);
    this.enviado.set(false);
    this.materiaForm.setValue({
      nombre: materia.nombre,
      profesor: materia.profesor,
      descripcion: materia.descripcion,
      color: materia.color,
    });
    this.formularioVisible.set(true);
  }

  protected cancelarFormulario(): void {
    this.resetForm();
    this.editandoId.set(null);
    this.formularioVisible.set(false);
  }

  protected pedirConfirmacion(id: string): void {
    this.errorMessage.set('');
    this.formularioVisible.set(false);
    this.confirmarEliminacionId.set(id);
  }

  protected eliminarMateria(id: string): void {
    this.errorMessage.set('');
    try {
      this.eduTrack.deleteMateria(id);
      this.confirmarEliminacionId.set(null);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No se pudo eliminar la materia.',
      );
    }
  }

  protected tareasAsociadas(materiaId: string): number {
    return this.tareasPorMateria().get(materiaId) ?? 0;
  }

  protected colorSeleccionado(color: MateriaColor): boolean {
    return this.materiaForm.controls.color.value === color;
  }

  protected get nombre() {
    return this.materiaForm.controls.nombre;
  }

  private resetForm(): void {
    this.materiaForm.reset({
      nombre: '',
      profesor: '',
      descripcion: '',
      color: DEFAULT_MATERIA_COLOR,
    });
    this.enviado.set(false);
  }
}
