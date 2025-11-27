import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

/**
 * Workix Checkbox Component
 *
 * Abstracted wrapper around PrimeNG Checkbox component.
 *
 * Usage:
 * ```html
 * <workix-checkbox
 *   [checked]="false"
 *   [indeterminate]="false"
 *   [disabled]="false"
 *   [label]="'Checkbox label'"
 *   (change)="onChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class WorkixCheckboxComponent {
  // Optional inputs
  checked = input<boolean>(false);
  indeterminate = input<boolean>(false);
  disabled = input<boolean>(false);
  label = input<string>('');
  color = input<'primary' | 'accent' | 'warn' | undefined>(undefined);
  class = input<string>('');

  // Outputs
  change = output<boolean>();

  // Computed
  checkboxId = computed(() => `workix-checkbox-${Math.random().toString(36).substr(2, 9)}`);

  checkboxClass = computed(() => {
    const baseClass = 'workix-checkbox';
    const colorClass = this.color() ? `workix-checkbox-${this.color()}` : '';
    const customClass = this.class();
    return [baseClass, colorClass, customClass].filter(Boolean).join(' ');
  });

  handleChange(event: Event | { target?: { checked?: boolean }; checked?: boolean }): void {
    let checked: boolean;
    if ('target' in event && event.target && 'checked' in event.target) {
      checked = (event.target as { checked?: boolean }).checked ?? !this.checked();
    } else if ('checked' in event) {
      checked = event.checked ?? !this.checked();
    } else {
      checked = !this.checked();
    }
    this.change.emit(checked);
  }
}
