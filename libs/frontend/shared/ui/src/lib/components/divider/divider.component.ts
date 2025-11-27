import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/**
 * Workix Divider Component
 *
 * Abstracted wrapper around PrimeNG Divider component.
 *
 * Usage:
 * ```html
 * <workix-divider [vertical]="false" [inset]="false" />
 * ```
 */
@Component({
  selector: 'workix-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
})
export class WorkixDividerComponent {
  // Optional inputs
  vertical = input<boolean>(false);
  inset = input<boolean>(false);
  class = input<string>('');

  // Computed
  dividerClass = computed(() => {
    const baseClass = 'workix-divider';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });
}
