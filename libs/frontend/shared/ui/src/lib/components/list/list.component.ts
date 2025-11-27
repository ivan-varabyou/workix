import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/**
 * Workix List Component
 *
 * Abstracted wrapper around PrimeNG List component.
 *
 * Usage:
 * ```html
 * <workix-list [dense]="false">
 *   <workix-list-item>Item 1</workix-list-item>
 *   <workix-list-item>Item 2</workix-list-item>
 * </workix-list>
 * ```
 */
@Component({
  selector: 'workix-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class WorkixListComponent {
  // Optional inputs
  dense = input<boolean>(false);
  class = input<string>('');

  // Computed
  listClass = computed(() => {
    const baseClass = 'workix-list';
    const denseClass = this.dense() ? 'workix-list-dense' : '';
    const customClass = this.class();
    return [baseClass, denseClass, customClass].filter(Boolean).join(' ');
  });
}
