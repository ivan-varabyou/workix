import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FormControl } from '@angular/forms';

/**
 * Workix Form Field Component
 *
 * Abstracted wrapper for form fields with label and error messages.
 * Uses Angular 2025 signals and computed values.
 *
 * Usage:
 * ```html
 * <workix-form-field
 *   [label]="'Email'"
 *   [control]="emailControl"
 *   [errorMessage]="'Email is required'"
 * >
 *   <workix-input [formControl]="emailControl" />
 * </workix-form-field>
 * ```
 */
@Component({
  selector: 'workix-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class WorkixFormFieldComponent {
  label = input<string>('');
  control = input<FormControl | undefined>(undefined);
  errorMessage = input<string>('');
  hint = input<string>('');
  required = input<boolean>(false);
  styleClass = input<string>('');

  // Computed signal for error state
  isError = computed(() => {
    const ctrl = this.control();
    return ctrl ? ctrl.invalid && ctrl.touched : false;
  });
}
