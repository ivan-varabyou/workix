import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCheckboxComponent } from '../checkbox/checkbox.component';
import { WorkixDatepickerComponent } from '../datepicker/datepicker.component';
import { WorkixFormFieldComponent } from '../form-field/form-field.component';
import { WorkixInputComponent } from '../input/input.component';
import { WorkixModalComponent } from '../modal/modal.component';
import { WorkixSelectComponent } from '../select/select.component';
import { FormDialogConfig } from './form-dialog.component.types';

/**
 * Workix FormDialog Component
 *
 * Generic component for forms in dialogs.
 * Replaces user-edit, role-edit, add-provider-dialog, etc.
 *
 * Usage:
 * ```html
 * <workix-form-dialog
 *   [visible]="isOpen()"
 *   [config]="formConfig"
 *   [isLoading]="isLoading()"
 *   [errorMessage]="errorMessage()"
 *   (submit)="onSubmit($event)"
 *   (cancel)="onCancel()"
 *   (visibleChange)="isOpen.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkixModalComponent,
    WorkixFormFieldComponent,
    WorkixInputComponent,
    WorkixSelectComponent,
    WorkixCheckboxComponent,
    WorkixDatepickerComponent,
    WorkixButtonComponent,
  ],
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
})
export class WorkixFormDialogComponent {
  // Required inputs
  visible = input<boolean>(false);
  config = input.required<FormDialogConfig>();

  // Optional inputs
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  submit = output<Record<string, any>>();
  cancel = output<void>();
  visibleChange = output<boolean>();

  // Form
  private fb = new FormBuilder();
  form = signal<FormGroup | null>(null);

  // Computed: Build form from config
  buildForm = computed(() => {
    const config = this.config();
    const formGroup: Record<string, any> = {};

    config.fields.forEach((field) => {
      const validators = field.validators || [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      const defaultValue = config.initialData?.[field.name] || field.defaultValue || '';
      formGroup[field.name] = [defaultValue, validators];
    });

    return this.fb.group(formGroup);
  });

  constructor() {
    // Initialize form when config changes
    effect(() => {
      this.form.set(this.buildForm());
    });
  }

  getFieldError(fieldName: string): string | null {
    const form = this.form();
    if (!form) return null;

    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    const config = this.config();
    const fieldConfig = config.fields.find((f) => f.name === fieldName);
    if (!fieldConfig?.errorMessages) return null;

    const errors = field.errors;
    for (const errorKey in errors) {
      if (fieldConfig.errorMessages[errorKey]) {
        return fieldConfig.errorMessages[errorKey];
      }
    }

    return null;
  }

  onSubmit(): void {
    const form = this.form();
    if (!form || form.invalid) return;

    this.submit.emit(form.value);
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  onModalClose(): void {
    this.visibleChange.emit(false);
  }
}
