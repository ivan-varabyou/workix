import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixFormFieldComponent } from '../form-field/form-field.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixInputComponent } from '../input/input.component';
import { WorkixListComponent } from '../list/list.component';
import { WorkixListItemComponent } from '../list/list-item.component';
import { WorkixSelectComponent } from '../select/select.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { WorkixToolbarComponent } from '../toolbar/toolbar.component';
import {
  PipelineBuilderConfig,
  PipelineStep,
  PipelineStepType,
} from './pipeline-builder.component.types';

/**
 * Workix PipelineBuilder Component
 *
 * Specific component for building pipelines with visual canvas.
 * Uses shared UI components for consistency.
 *
 * Usage:
 * ```html
 * <workix-pipeline-builder
 *   [config]="builderConfig"
 *   [isLoading]="isLoading()"
 *   [isSaving]="isSaving()"
 *   (save)="onSave($event)"
 *   (cancel)="onCancel()"
 * />
 * ```
 */
@Component({
  selector: 'workix-pipeline-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    WorkixToolbarComponent,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixFormFieldComponent,
    WorkixInputComponent,
    WorkixSelectComponent,
    WorkixSpinnerComponent,
    WorkixDividerComponent,
  ],
  templateUrl: './pipeline-builder.component.html',
  styleUrls: ['./pipeline-builder.component.scss'],
})
export class WorkixPipelineBuilderComponent {
  // Required inputs
  config = input.required<PipelineBuilderConfig>();

  // Optional inputs
  isLoading = input<boolean>(false);
  isSaving = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  save = output<{ name: string; description: string; steps: PipelineStep[] }>();
  cancel = output<void>();
  stepAdd = output<PipelineStep>();
  stepDelete = output<string>();
  stepSelect = output<PipelineStep>();

  // Internal state
  private fb = new FormBuilder();
  pipelineForm = signal<FormGroup | null>(null);
  steps = signal<PipelineStep[]>([]);
  selectedStep = signal<PipelineStep | null>(null);

  // Computed
  stepCount = computed(() => this.steps().length);
  isValid = computed(() => {
    const form = this.pipelineForm();
    return form?.valid && this.stepCount() > 0;
  });

  constructor() {
    // Initialize form
    effect(() => {
      const config = this.config();
      const form = this.fb.group({
        name: [config.initialData?.name || '', Validators.required],
        description: [config.initialData?.description || ''],
      });
      this.pipelineForm.set(form);

      if (config.initialData?.steps) {
        this.steps.set(config.initialData.steps);
      }
    });
  }

  getStepIcon(type: string): string {
    const iconMap: Record<string, string> = {
      http: 'language',
      database: 'storage',
      transform: 'transform',
      conditional: 'branch',
      loop: 'repeat',
      script: 'code',
      email: 'email',
      webhook: 'cloud_queue',
      delay: 'schedule',
    };
    return iconMap[type] || 'settings';
  }

  addStep(): void {
    const config = this.config();
    const stepTypes = config.stepTypes || [];
    const defaultType: string = stepTypes[0]?.value || 'http';

    const newStep: PipelineStep = {
      id: `step-${Date.now()}`,
      name: 'New Step',
      type: defaultType as PipelineStepType,
      config: {},
      position: { x: 100 + this.steps().length * 50, y: 100 + this.steps().length * 50 },
      order: this.steps().length,
    };

    this.steps.update((steps) => [...steps, newStep]);
    this.selectedStep.set(newStep);
    this.stepAdd.emit(newStep);
  }

  deleteStep(stepId: string): void {
    this.steps.update((steps) => steps.filter((s) => s.id !== stepId));
    if (this.selectedStep()?.id === stepId) {
      this.selectedStep.set(null);
    }
    this.stepDelete.emit(stepId);
  }

  selectStep(step: PipelineStep): void {
    this.selectedStep.set(step);
    this.stepSelect.emit(step);
  }

  onSave(): void {
    const form = this.pipelineForm();
    if (!form || !form.valid) return;

    this.save.emit({
      name: form.get('name')?.value,
      description: form.get('description')?.value || '',
      steps: this.steps(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
