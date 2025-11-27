import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

/**
 * Workix Datepicker Component
 *
 * Abstracted wrapper around PrimeNG Datepicker component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-datepicker
 *   [value]="date"
 *   [placeholder]="'Select date'"
 *   [disabled]="false"
 *   [min]="minDate"
 *   [max]="maxDate"
 *   (dateChange)="onDateChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class WorkixDatepickerComponent {
  // Optional inputs
  value = input<Date | undefined>(undefined);
  label = input<string>('');
  placeholder = input<string>('Select date');
  disabled = input<boolean>(false);
  min = input<Date | undefined>(undefined);
  max = input<Date | undefined>(undefined);
  class = input<string>('');

  // Outputs
  dateChange = output<Date | null>();

  // Computed
  inputId = computed(() => `workix-datepicker-${Math.random().toString(36).substr(2, 9)}`);

  formFieldClass = computed(() => {
    const baseClass = 'workix-datepicker';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });

  datepickerClass = computed(() => {
    const baseClass = 'workix-datepicker';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleDateChange(event: Event | { target?: { value?: string }; value?: string | Date }): void {
    let date: Date | null = null;
    if ('target' in event && event.target && 'value' in event.target) {
      const targetValue: string | undefined = (event.target as { value?: string }).value;
      if (targetValue) {
        date = new Date(targetValue);
      }
    } else if ('value' in event && event.value) {
      date = event.value instanceof Date ? event.value : new Date(event.value);
    }
    this.dateChange.emit(date);
  }
}
