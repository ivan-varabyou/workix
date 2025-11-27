import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

export interface SortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

/**
 * Workix Sort Component
 *
 * Abstracted wrapper around PrimeNG Sort component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-sort
 *   [active]="'name'"
 *   [direction]="'asc'"
 *   (sortChange)="onSortChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-sort',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss'],
})
export class WorkixSortComponent {
  // Optional inputs
  active = input<string>('');
  direction = input<'asc' | 'desc' | ''>('');
  disableClear = input<boolean>(false);
  class = input<string>('');

  // Outputs
  sortChange = output<SortEvent>();

  // Computed
  sortClass = computed(() => {
    const baseClass = 'workix-sort';
    const directionClass = this.direction() ? `workix-sort-${this.direction()}` : '';
    const customClass = this.class();
    return [baseClass, directionClass, customClass].filter(Boolean).join(' ');
  });

  iconClass = computed(() => {
    const baseClass = 'workix-sort-icon';
    return baseClass;
  });

  sortIcon = computed(() => {
    if (this.direction() === 'asc') return '↑';
    if (this.direction() === 'desc') return '↓';
    return '⇅';
  });

  handleSortChange(event: { active?: string; direction?: string }): void {
    const sortEvent: SortEvent = {
      active: event.active || this.active(),
      direction: (event.direction || '') as 'asc' | 'desc' | '',
    };
    this.sortChange.emit(sortEvent);
  }

  toggleSort(): void {
    let newDirection: 'asc' | 'desc' | '' = '';
    if (this.direction() === '') {
      newDirection = 'asc';
    } else if (this.direction() === 'asc') {
      newDirection = 'desc';
    } else if (this.direction() === 'desc' && !this.disableClear()) {
      newDirection = '';
    } else {
      newDirection = 'asc';
    }

    const sortEvent: SortEvent = {
      active: this.active(),
      direction: newDirection,
    };
    this.sortChange.emit(sortEvent);
  }
}
