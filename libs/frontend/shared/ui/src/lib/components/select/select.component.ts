import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { FormFieldOption, FormFieldValue } from '../../interfaces/form.interface';

/**
 * Workix Select Component
 *
 * Abstracted wrapper around PrimeNG Select component.
 * Uses Angular 2025 signals and new control flow.
 *
 * Usage:
 * ```html
 * <workix-select
 *   [options]="options()"
 *   [value]="selectedValue()"
 *   [placeholder]="'Select option'"
 *   [disabled]="false"
 *   (valueChange)="handleChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-select',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WorkixSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class WorkixSelectComponent implements ControlValueAccessor {
  options = input<FormFieldOption[]>([]);
  value = input<FormFieldValue>(null);
  placeholder = input<string>('Select option');
  disabled = input<boolean>(false);
  showClear = input<boolean>(false);
  filter = input<boolean>(false);
  styleClass = input<string>('');

  // Internal signal for two-way binding
  private internalValue = signal<FormFieldValue>(null);

  // Computed value that syncs with input
  displayValue = computed(() => {
    const inputValue: FormFieldValue = this.value();
    if (inputValue !== this.internalValue()) {
      this.internalValue.set(inputValue);
    }
    return this.internalValue();
  });

  valueChange = output<FormFieldValue>();

  // ControlValueAccessor callbacks - initialized as no-ops, will be set by registerOnChange/registerOnTouched
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange = (_value: FormFieldValue) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched = () => {};

  onSelectionChange(event: { value: FormFieldValue }): void {
    const newValue: FormFieldValue = event.value;
    this.internalValue.set(newValue);
    this.valueChange.emit(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: FormFieldValue): void {
    if (value !== this.internalValue()) {
      this.internalValue.set(value);
    }
  }

  registerOnChange(fn: (value: FormFieldValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Disabled state is managed via input signal
  }
}
