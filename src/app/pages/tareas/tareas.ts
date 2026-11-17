import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { EstadoTarea, PrioridadTarea, Tarea } from '../../models/tarea.model';
import { EduTrackService } from '../../services/edutrack.service';

@Component({
  selector: 'app-tareas',
  imports: [ReactiveFormsModule],
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tareas {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  protected readonly eduTrack = inject(EduTrackService);

  protected readonly formularioVisible = signal(false);
  protected readonly enviado = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly confirmarEliminacionId = signal<string | null>(null);
  protected readonly errorMessage = signal('');

  protected readonly tareasConMateria = computed(() =>
    this.eduTrack.tareas().map((tarea) => ({
      tarea,
      materia: tarea.materiaId ? this.eduTrack.getMateria(tarea.materiaId) : undefined,
    })),
  );

  private readonly nonBlankValidator: ValidatorFn = (control) =>
    typeof control.value === 'string' && control.value.trim().length > 0
      ? null
      : { blank: true };

  protected readonly tareaForm = this.formBuilder.group({
    titulo: ['', [Validators.required, Validators.maxLength(100), this.nonBlankValidator]],
    descripcion: ['', [Validators.maxLength(300)]],
    materiaId: [''],
    fechaEntrega: [''],
    prioridad: ['media' as PrioridadTarea],
    estado: ['pendiente' as EstadoTarea],
  });

  protected guardarTarea(): void {
    this.enviado.set(true);
    this.errorMessage.set('');
    if (this.tareaForm.invalid) {
      this.tareaForm.markAllAsTouched();
      return;
    }

    const { titulo, descripcion, materiaId, fechaEntrega, prioridad, estado } =
      this.tareaForm.getRawValue();
    const changes = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      materiaId: materiaId || null,
      fechaEntrega: fechaEntrega || null,
      prioridad,
      estado,
    };

    try {
      const id = this.editandoId();
      if (id) this.eduTrack.updateTarea(id, changes);
      else this.eduTrack.createTarea(changes);
      this.cancelarFormulario();
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo guardar la tarea.');
    }
  }

  protected abrirNuevaTarea(): void {
    this.resetForm();
    this.editandoId.set(null);
    this.confirmarEliminacionId.set(null);
    this.errorMessage.set('');
    this.formularioVisible.set(true);
  }

  protected editarTarea(tarea: Tarea): void {
    this.confirmarEliminacionId.set(null);
    this.errorMessage.set('');
    this.editandoId.set(tarea.id);
    this.enviado.set(false);
    this.tareaForm.setValue({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      materiaId: tarea.materiaId ?? '',
      fechaEntrega: tarea.fechaEntrega ?? '',
      prioridad: tarea.prioridad,
      estado: tarea.estado,
    });
    this.formularioVisible.set(true);
  }

  protected cambiarEstado(tarea: Tarea): void {
    this.errorMessage.set('');
    try {
      this.eduTrack.updateTarea(tarea.id, {
        estado: tarea.estado === 'pendiente' ? 'completada' : 'pendiente',
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo actualizar el estado.');
    }
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

  protected eliminarTarea(id: string): void {
    this.errorMessage.set('');
    try {
      this.eduTrack.deleteTarea(id);
      this.confirmarEliminacionId.set(null);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo eliminar la tarea.');
    }
  }

  protected prioridadTexto(prioridad: PrioridadTarea): string {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
  }

  protected fechaTexto(fecha: string | null): string {
    if (!fecha) return 'Sin fecha de entrega';
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(`${fecha}T00:00:00`),
    );
  }

  protected get titulo() {
    return this.tareaForm.controls.titulo;
  }

  private resetForm(): void {
    this.tareaForm.reset({
      titulo: '', descripcion: '', materiaId: '', fechaEntrega: '', prioridad: 'media', estado: 'pendiente',
    });
    this.enviado.set(false);
  }
}
