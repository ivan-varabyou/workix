import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/**
 * Workix Icon Component
 *
 * Abstracted wrapper around PrimeNG Icon component.
 *
 * Usage:
 * ```html
 * <workix-icon name="home" [size]="'md'" [color]="'primary'" />
 * ```
 */
@Component({
  selector: 'workix-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class WorkixIconComponent {
  // Required inputs
  name = input<string>('');

  // Optional inputs
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<string | undefined>(undefined);
  class = input<string>('');

  // Computed
  iconClass = computed(() => {
    const baseClass = `pi pi-${this.name()}`;
    const sizeClass = `workix-icon-${this.size()}`;
    const customClass = this.class();
    return [baseClass, sizeClass, customClass].filter(Boolean).join(' ');
  });

  sizeComputed = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: '16px',
      md: '24px',
      lg: '32px',
    };
    return sizeMap[this.size()] || '24px';
  });
}
