import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/**
 * Workix Badge Component
 *
 * Abstracted wrapper around PrimeNG Badge component.
 *
 * Usage:
 * ```html
 * <workix-badge [value]="5" [color]="'warn'" [overlap]="true">
 *   <workix-icon name="notifications" />
 * </workix-badge>
 * ```
 */
@Component({
  selector: 'workix-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class WorkixBadgeComponent {
  // Optional inputs
  value = input<string | number | undefined>(undefined);
  color = input<'primary' | 'accent' | 'warn' | undefined>(undefined);
  overlap = input<boolean>(true);
  hidden = input<boolean>(false);
  class = input<string>('');

  // Computed
  badgeClass = computed(() => {
    const baseClass = 'workix-badge';
    const colorClass = this.color() ? `workix-badge-${this.color()}` : '';
    const customClass = this.class();
    return [baseClass, colorClass, customClass].filter(Boolean).join(' ');
  });
}
