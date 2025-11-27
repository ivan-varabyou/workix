import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  CreatePipelineDto,
  PipelineStep,
  UpdatePipelineDto,
} from '@workix/shared/frontend/core';
import {
  CanvasConfig,
  PipelineBuilderConfig,
  PipelineStep as UIPipelineStep,
  StepEditorConfig,
  WorkixCanvasComponent,
  WorkixPipelineBuilderComponent,
  WorkixSnackbarService,
  WorkixStepEditorComponent,
} from '@workix/shared/frontend/ui';

import { PipelineService } from '../../services/pipeline.service';

// Type guard for PipelineStep type
function isValidPipelineStepType(value: string): value is PipelineStep['type'] {
  const validTypes: readonly string[] = [
    'http',
    'database',
    'transform',
    'conditional',
    'loop',
    'script',
    'email',
    'webhook',
    'delay',
  ];
  for (const validType of validTypes) {
    if (value === validType) {
      return true;
    }
  }
  return false;
}

// Helper functions to convert between PipelineStep and UI PipelineStep
function appStepToUIStep(appStep: PipelineStep): UIPipelineStep {
  const stepType: UIPipelineStep['type'] = isValidPipelineStepType(appStep.type)
    ? (appStep.type as UIPipelineStep['type'])
    : 'http';
  return {
    id: appStep.id || `step-${Date.now()}`,
    name: appStep.name,
    type: stepType,
    position: appStep.position || { x: 0, y: 0 },
    order: appStep.order,
    config: appStep.config || {},
  };
}

function uiStepToAppStep(uiStep: UIPipelineStep): PipelineStep {
  return {
    id: uiStep.id,
    name: uiStep.name,
    type: uiStep.type,
    order: uiStep.order || 0,
    position: uiStep.position,
    config: uiStep.config,
  };
}

@Component({
  selector: 'app-pipeline-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixPipelineBuilderComponent,
    WorkixStepEditorComponent,
    WorkixCanvasComponent,
  ],
  templateUrl: './pipeline-builder.component.html',
  styleUrl: './pipeline-builder.component.scss',
})
export class PipelineBuilderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private pipelineService = inject(PipelineService);
  private snackbar = inject(WorkixSnackbarService);

  pipelineForm: FormGroup;
  steps = signal<UIPipelineStep[]>([]);
  selectedStep = signal<UIPipelineStep | null>(null);
  pipelineId = signal<string | null>(null);
  isLoading = signal(false);

  stepTypes = [
    { value: 'http', label: 'HTTP Request', icon: 'language' },
    { value: 'database', label: 'Database Query', icon: 'storage' },
    { value: 'transform', label: 'Data Transform', icon: 'transform' },
    { value: 'conditional', label: 'Conditional', icon: 'branch' },
    { value: 'loop', label: 'Loop', icon: 'repeat' },
    { value: 'script', label: 'Custom Script', icon: 'code' },
    { value: 'email', label: 'Send Email', icon: 'email' },
    { value: 'webhook', label: 'Webhook', icon: 'cloud_queue' },
    { value: 'delay', label: 'Delay', icon: 'schedule' },
  ];

  // Computed: Build pipeline builder config
  pipelineBuilderConfig = computed<PipelineBuilderConfig>(() => ({
    title: 'Pipeline Builder',
    showToolbar: true,
    showStepsList: true,
    showStepEditor: !!this.selectedStep(),
    stepTypes: this.stepTypes,
    initialData: {
      name: this.pipelineForm.get('name')?.value || '',
      description: this.pipelineForm.get('description')?.value || '',
      steps: this.steps(),
    },
  }));

  // Computed: Build step editor config
  stepEditorConfig = computed<StepEditorConfig>(() => ({
    title: this.selectedStep()?.name || 'Step Editor',
    showTabs: true,
    showDeleteButton: true,
    stepTypes: this.stepTypes,
  }));

  // Computed: Build canvas config
  canvasConfig = computed<CanvasConfig>(() => ({
    width: 800,
    height: 600,
    showConnections: true,
    showGrid: true,
    gridSize: 20,
    stepSize: { width: 120, height: 80 },
  }));

  constructor() {
    this.pipelineForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.pipelineId.set(params['id']);
        this.loadPipeline(params['id']);
      }
    });
  }

  loadPipeline(id: string): void {
    this.isLoading.set(true);
    this.pipelineService.getPipeline(id).subscribe({
      next: (pipeline) => {
        this.pipelineForm.patchValue({
          name: pipeline.name,
          description: pipeline.description,
        });
        const uiSteps: UIPipelineStep[] = (pipeline.steps || []).map(appStepToUIStep);
        this.steps.set(uiSteps);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pipeline:', err);
        this.snackbar.open('Error loading pipeline', undefined, {
          panelClass: 'error',
        });
        this.isLoading.set(false);
      },
    });
  }

  addStep(): void {
    const newStep: UIPipelineStep = {
      id: `step-${Date.now()}`,
      name: 'New Step',
      type: 'http',
      config: {},
      position: {
        x: 100 + this.steps().length * 50,
        y: 100 + this.steps().length * 50,
      },
    };
    this.steps.set([...this.steps(), newStep]);
    this.selectedStep.set(newStep);
  }

  editStep(step: UIPipelineStep): void {
    this.selectedStep.set(step);
  }

  saveStepConfig(updatedStep: UIPipelineStep): void {
    const index = this.steps().findIndex((s) => s.id === updatedStep.id);
    if (index !== -1) {
      const updatedSteps = [...this.steps()];
      updatedSteps[index] = updatedStep;
      this.steps.set(updatedSteps);
      this.snackbar.open('Step updated', undefined, { panelClass: 'success' });
    }
  }

  deleteStepConfig(): void {
    const step = this.selectedStep();
    if (step) {
      const index = this.steps().findIndex((s) => s.id === step.id);
      if (index !== -1) {
        const updatedSteps = [...this.steps()];
        updatedSteps.splice(index, 1);
        this.steps.set(updatedSteps);
        this.selectedStep.set(null);
        this.snackbar.open('Step deleted', undefined, {
          panelClass: 'success',
        });
      }
    }
  }

  deleteStep(index: number): void {
    const updatedSteps = [...this.steps()];
    updatedSteps.splice(index, 1);
    this.steps.set(updatedSteps);
    const step = this.selectedStep();
    if (step && step.id === this.steps()[index]?.id) {
      this.selectedStep.set(null);
    }
  }

  savePipeline(): void {
    if (this.pipelineForm.invalid) {
      this.snackbar.open('Please fill in all required fields', undefined, {
        panelClass: 'error',
      });
      return;
    }

    const formValue = this.pipelineForm.value;
    const dtoSteps: PipelineStep[] = this.steps().map(uiStepToAppStep);

    if (this.pipelineId()) {
      const updateDto: UpdatePipelineDto & { id: string } = {
        id: this.pipelineId()!,
        name: formValue.name,
        description: formValue.description,
        steps: dtoSteps,
      };
      this.pipelineService.updatePipeline(updateDto).subscribe({
        next: () => {
          this.snackbar.open('Pipeline saved successfully', undefined, {
            panelClass: 'success',
          });
          this.router.navigate(['/pipelines']);
        },
        error: (err) => {
          console.error('Error saving pipeline:', err);
          this.snackbar.open('Error saving pipeline', undefined, {
            panelClass: 'error',
          });
        },
      });
    } else {
      const createDto: CreatePipelineDto = {
        name: formValue.name,
        description: formValue.description,
        steps: dtoSteps,
      };
      this.pipelineService.createPipeline(createDto).subscribe({
        next: () => {
          this.snackbar.open('Pipeline created successfully', undefined, {
            panelClass: 'success',
          });
          this.router.navigate(['/pipelines']);
        },
        error: (err) => {
          console.error('Error creating pipeline:', err);
          this.snackbar.open('Error creating pipeline', undefined, {
            panelClass: 'error',
          });
        },
      });
    }
  }

  getStepIcon(type: string): string {
    const stepType = this.stepTypes.find((st) => st.value === type);
    return stepType ? stepType.icon : 'settings';
  }

  goBack(): void {
    this.router.navigate(['/pipelines']);
  }
}
