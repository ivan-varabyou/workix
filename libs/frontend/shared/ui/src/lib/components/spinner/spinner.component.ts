import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/**
 * Workix Spinner Component
 *
 * Abstracted wrapper around PrimeNG ProgressSpinner component.
 * Uses Angular 2025 signals.
 *
 * Usage:
 * ```html
 * <workix-spinner
 *   [loading]="isLoading()"
 *   [size]="'md'"
 * />
 * ```
 */
@Component({
  selector: 'workix-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class WorkixSpinnerComponent {
  loading = input<boolean>(true);
  size = input<'sm' | 'md' | 'lg'>('md');
  strokeWidth = input<string>('4');
  styleClass = input<string>('');

  // Computed signal for PrimeNG size
  spinnerSize = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: 'small',
      md: 'medium',
      lg: 'large',
    };
    return sizeMap[this.size()] || 'medium';
  });
}
