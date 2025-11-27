import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Workix Input Component
 *
 * Abstracted wrapper around PrimeNG InputText component.
 * Uses Angular 2025 signals and new control flow.
 *
 * Usage:
 * ```html
 * <workix-input
 *   [value]="inputValue()"
 *   [placeholder]="'Enter text'"
 *   [disabled]="false"
 *   (valueChange)="handleChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-input',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WorkixInputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class WorkixInputComponent implements ControlValueAccessor {
  value = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  styleClass = input<string>('');

  // Internal signal for two-way binding
  private internalValue = signal<string>('');

  // Computed value that syncs with input
  displayValue = computed(() => {
    const inputValue = this.value();
    if (inputValue !== this.internalValue()) {
      this.internalValue.set(inputValue);
    }
    return this.internalValue();
  });

  valueChange = output<string>();

  // ControlValueAccessor callbacks - initialized as no-ops, will be set by registerOnChange/registerOnTouched
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange = (_value: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.internalValue.set(newValue);
    this.valueChange.emit(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value !== this.internalValue()) {
      this.internalValue.set(value || '');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Disabled state is managed via input signal
  }
}
