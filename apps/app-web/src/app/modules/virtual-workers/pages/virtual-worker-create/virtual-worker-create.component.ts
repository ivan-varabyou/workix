import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  WorkixButtonComponent,
  WorkixInputComponent,
  WorkixSelectComponent,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

import {
  CreateVirtualWorkerDto,
  VirtualWorkerService,
} from '../../services/virtual-worker.service';

@Component({
  selector: 'app-virtual-worker-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixInputComponent,
    WorkixSelectComponent,
    WorkixButtonComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './virtual-worker-create.component.html',
  styleUrl: './virtual-worker-create.component.scss',
})
export class VirtualWorkerCreateComponent {
  private fb = inject(FormBuilder);
  private workerService = inject(VirtualWorkerService);

  // Dialog reference will be passed from parent component
  dialogRef: { close: (result?: Record<string, unknown> | null) => void } | null = null;

  isCreating = signal(false);

  workerForm = this.fb.group({
    name: ['', Validators.required],
    type: ['MARKETER', Validators.required],
    description: [''],
    config: ['{}', [Validators.required, this.jsonValidator]],
  });

  jsonValidator(control: AbstractControl): ValidationErrors | null {
    try {
      JSON.parse(control.value as string);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  onCreate(): void {
    if (this.workerForm.invalid) {
      this.workerForm.markAllAsTouched();
      return;
    }

    const formValue = this.workerForm.value;
    let config: Record<string, unknown>;

    try {
      config = JSON.parse(formValue.config || '{}') as Record<string, unknown>;
    } catch (error) {
      alert('Invalid JSON format in config');
      return;
    }

    const dto: CreateVirtualWorkerDto = {
      name: formValue.name!,
      type: formValue.type as 'MARKETER' | 'DESIGNER' | 'COPYWRITER' | 'ANALYST' | 'CUSTOM',
      config,
    };
    if (
      formValue.description !== undefined &&
      formValue.description !== null &&
      formValue.description !== ''
    ) {
      dto.description = formValue.description;
    }

    this.isCreating.set(true);
    this.workerService.create(dto).subscribe({
      next: (worker) => {
        if (this.dialogRef) {
          const workerRecord: Record<string, unknown> = {
            id: worker.id,
            name: worker.name,
            type: worker.type,
            description: worker.description,
            status: worker.status,
            config: worker.config,
            metrics: worker.metrics,
            createdAt: worker.createdAt,
            updatedAt: worker.updatedAt,
          };
          this.dialogRef.close(workerRecord);
        }
        this.isCreating.set(false);
      },
      error: (error) => {
        console.error('Failed to create worker:', error);
        alert('Failed to create worker');
        this.isCreating.set(false);
      },
    });
  }

  onCancel(): void {}
}
