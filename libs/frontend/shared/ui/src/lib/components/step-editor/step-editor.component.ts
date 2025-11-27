import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixCheckboxComponent } from '../checkbox/checkbox.component';
import { WorkixFormFieldComponent } from '../form-field/form-field.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixInputComponent } from '../input/input.component';
import { WorkixSelectComponent } from '../select/select.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { WorkixTabsComponent } from '../tabs/tabs.component';
import { StepEditorConfig, StepEditorStep } from './step-editor.component.types';

/**
 * Workix StepEditor Component
 *
 * Specific component for editing pipeline steps.
 * Uses shared UI components for consistency.
 *
 * Usage:
 * ```html
 * <workix-step-editor
 *   [step]="selectedStep"
 *   [config]="editorConfig"
 *   [isLoading]="isLoading()"
 *   (save)="onSave($event)"
 *   (delete)="onDelete()"
 *   (cancel)="onCancel()"
 * />
 * ```
 */
@Component({
  selector: 'workix-step-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixCardComponent,
    WorkixTabsComponent,
    WorkixFormFieldComponent,
    WorkixInputComponent,
    WorkixSelectComponent,
    WorkixCheckboxComponent,
    WorkixButtonComponent,
    WorkixSpinnerComponent,
    WorkixIconComponent,
  ],
  templateUrl: './step-editor.component.html',
  styleUrls: ['./step-editor.component.scss'],
})
export class WorkixStepEditorComponent {
  // Required inputs
  step = input.required<StepEditorStep>();
  config = input<StepEditorConfig>({});

  // Optional inputs
  isLoading = input<boolean>(false);

  // Outputs
  save = output<StepEditorStep>();
  delete = output<void>();
  cancel = output<void>();

  // Internal state
  private fb = new FormBuilder();
  stepForm = signal<FormGroup | null>(null);
  activeTab = signal<number>(0);

  // Computed
  stepType = computed(() => this.step().type);
  showTabs = computed(() => this.config().showTabs !== false);
  showDeleteButton = computed(() => this.config().showDeleteButton !== false);

  constructor() {
    // Initialize form when step changes
    effect(() => {
      const step = this.step();
      if (step) {
        const form = this.fb.group({
          name: [step.name || '', Validators.required],
          type: [step.type || 'http', Validators.required],
          description: [step.config?.description || ''],
          // HTTP config
          method: [step.config?.method || 'GET'],
          url: [step.config?.url || ''],
          headers: [step.config?.headers || ''],
          body: [step.config?.body || ''],
          // Database config
          database: [step.config?.database || 'postgresql'],
          query: [step.config?.query || ''],
          // Transform config
          script: [step.config?.script || ''],
          // Conditional config
          condition: [step.config?.condition || ''],
          trueBranch: [step.config?.trueBranch || ''],
          falseBranch: [step.config?.falseBranch || ''],
          // Email config
          to: [step.config?.to || ''],
          subject: [step.config?.subject || ''],
          emailBody: [step.config?.emailBody || ''],
          // Delay config
          delay: [step.config?.delay || 1000],
          // Retry config
          retryEnabled: [step.config?.retryEnabled || false],
          maxRetries: [step.config?.maxRetries || 3],
          retryDelay: [step.config?.retryDelay || 1000],
          backoffStrategy: [step.config?.backoffStrategy || 'exponential'],
          // Timeout config
          timeout: [step.config?.timeout || 30],
          onTimeoutAction: [step.config?.onTimeoutAction || 'fail'],
        });
        this.stepForm.set(form);
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

  onSave(): void {
    const form = this.stepForm();
    if (!form || !form.valid) return;

    const updatedStep: StepEditorStep = {
      ...this.step(),
      name: form.get('name')?.value,
      type: form.get('type')?.value,
      config: {
        description: form.get('description')?.value,
        method: form.get('method')?.value,
        url: form.get('url')?.value,
        headers: form.get('headers')?.value,
        body: form.get('body')?.value,
        database: form.get('database')?.value,
        query: form.get('query')?.value,
        script: form.get('script')?.value,
        condition: form.get('condition')?.value,
        trueBranch: form.get('trueBranch')?.value,
        falseBranch: form.get('falseBranch')?.value,
        to: form.get('to')?.value,
        subject: form.get('subject')?.value,
        emailBody: form.get('emailBody')?.value,
        delay: form.get('delay')?.value,
        retryEnabled: form.get('retryEnabled')?.value,
        maxRetries: form.get('maxRetries')?.value,
        retryDelay: form.get('retryDelay')?.value,
        backoffStrategy: form.get('backoffStrategy')?.value,
        timeout: form.get('timeout')?.value,
        onTimeoutAction: form.get('onTimeoutAction')?.value,
      },
    };

    this.save.emit(updatedStep);
  }

  onDelete(): void {
    this.delete.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }
}
