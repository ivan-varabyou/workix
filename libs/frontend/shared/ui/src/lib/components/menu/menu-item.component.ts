import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Workix Menu Item Component
 *
 * Abstracted wrapper around PrimeNG Menu Item component.
 *
 * Usage:
 * ```html
 * <workix-menu-item [disabled]="false" (click)="handleClick()">
 *   Menu Item
 * </workix-menu-item>
 * ```
 */
@Component({
  selector: 'workix-menu-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
})
export class WorkixMenuItemComponent {
  // Optional inputs
  disabled = input<boolean>(false);
  class = input<string>('');
  routerLink = input<string | null>(null);

  // Outputs
  click = output<void>();

  // Computed
  itemClass = computed(() => {
    const baseClass = 'workix-menu-item';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });

  handleClick(): void {
    if (!this.disabled()) {
      this.click.emit();
    }
  }
}
