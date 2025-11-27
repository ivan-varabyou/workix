import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PipelineStep as UIPipelineStep,
  WorkixButtonComponent,
  WorkixCanvasComponent,
  WorkixCardComponent,
  WorkixDividerComponent,
  WorkixIconComponent,
  WorkixInputComponent,
  WorkixListComponent,
  WorkixListItemComponent,
  WorkixPipelineBuilderComponent,
  WorkixSelectComponent,
  WorkixStepEditorComponent,
} from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-pipeline-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixPipelineBuilderComponent,
    WorkixStepEditorComponent,
    WorkixCanvasComponent,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixInputComponent,
    WorkixSelectComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixDividerComponent,
  ],
  templateUrl: './pipeline-builder.component.html',
  styleUrls: ['./pipeline-builder.component.scss'],
})
export class PipelineBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals
  steps = signal<UIPipelineStep[]>([]);
  isSaving = signal(false);
  selectedStep = signal<UIPipelineStep | null>(null);

  // Form
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    schedule: [''],
    timeout: [300, [Validators.required, Validators.min(1)]],
  });

  // Computed
  stepCount = computed(() => this.steps().length);
  isValid = computed(() => this.form.valid && this.stepCount() > 0);

  // Computed: Build pipeline builder config
  pipelineBuilderConfig = computed(() => ({
    title: 'Pipeline Builder',
    showToolbar: true,
    showStepsList: true,
    showStepEditor: !!this.selectedStep(),
    stepTypes: [
      { value: 'http', label: 'HTTP Request', icon: 'language' },
      { value: 'database', label: 'Database Query', icon: 'storage' },
      { value: 'email', label: 'Send Email', icon: 'mail' },
      { value: 'transform', label: 'Data Transform', icon: 'transform' },
      { value: 'condition', label: 'Conditional', icon: 'branch' },
    ],
    initialData: {
      name: this.form.get('name')?.value || '',
      description: this.form.get('description')?.value || '',
      steps: this.steps(),
    },
  }));

  // Computed: Build step editor config
  stepEditorConfig = computed(() => ({
    title: this.selectedStep()?.name || 'Step Editor',
    showTabs: true,
    showDeleteButton: true,
    stepTypes: [
      { value: 'http', label: 'HTTP Request', icon: 'language' },
      { value: 'database', label: 'Database Query', icon: 'storage' },
      { value: 'email', label: 'Send Email', icon: 'mail' },
      { value: 'transform', label: 'Data Transform', icon: 'transform' },
      { value: 'condition', label: 'Conditional', icon: 'branch' },
    ],
  }));

  // Computed: Build canvas config
  canvasConfig = computed(() => ({
    width: 800,
    height: 600,
    showConnections: true,
    showGrid: true,
    gridSize: 20,
    stepSize: { width: 120, height: 80 },
  }));

  ngOnInit(): void {
    // Load existing pipeline if editing
    this.loadPipelineData();
  }

  loadPipelineData(): void {
    // Would load from route params or service
  }

  addStep(): void {
    const newStep: UIPipelineStep = {
      id: Date.now().toString(),
      name: `Step ${this.steps().length + 1}`,
      type: 'http',
      config: {},
      position: {
        x: 100 + this.steps().length * 50,
        y: 100 + this.steps().length * 50,
      },
      order: this.steps().length,
    };

    this.steps.update((s) => [...s, newStep]);
  }

  editStep(step: UIPipelineStep): void {
    this.selectedStep.set(step);
    // Would open modal for editing
  }

  deleteStep(stepId: string): void {
    this.steps.update((s) => s.filter((step) => step.id !== stepId));
  }

  reorderSteps(fromIndex: number, toIndex: number): void {
    this.steps.update((s) => {
      const updated = [...s];
      const [removed] = updated.splice(fromIndex, 1);
      if (removed) {
        updated.splice(toIndex, 0, removed);
      }
      return updated;
    });
  }

  savePipeline(): void {
    if (!this.isValid()) return;

    this.isSaving.set(true);

    // API call would go here
    // const pipelineData = {
    //   ...this.form.value,
    //   steps: this.steps()};
    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/pipelines']);
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(['/pipelines']);
  }

  saveStepConfig(updatedStep: UIPipelineStep): void {
    const index = this.steps().findIndex((s) => s.id === updatedStep.id);
    if (index !== -1) {
      const updatedSteps = [...this.steps()];
      updatedSteps[index] = updatedStep;
      this.steps.set(updatedSteps);
      this.selectedStep.set(null);
    }
  }

  deleteStepConfig(): void {
    const step = this.selectedStep();
    if (step) {
      this.deleteStep(step.id);
      this.selectedStep.set(null);
    }
  }

  getStepIcon(type: string): string {
    const iconMap: Record<string, string> = {
      http: 'api',
      database: 'storage',
      email: 'mail',
      transform: 'transform',
      condition: 'branch',
    };
    return iconMap[type] || 'circle';
  }
}
