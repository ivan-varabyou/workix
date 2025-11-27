import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Workix List Item Component
 *
 * Abstracted wrapper around PrimeNG List Item component.
 *
 * Usage:
 * ```html
 * <workix-list-item [disabled]="false" [selected]="false">
 *   Content
 * </workix-list-item>
 * ```
 */
@Component({
  selector: 'workix-list-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class WorkixListItemComponent {
  // Optional inputs
  disabled = input<boolean>(false);
  selected = input<boolean>(false);
  class = input<string>('');
  routerLink = input<string | null>(null);

  // Computed
  itemClass = computed(() => {
    const baseClass = 'workix-list-item';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });
}
