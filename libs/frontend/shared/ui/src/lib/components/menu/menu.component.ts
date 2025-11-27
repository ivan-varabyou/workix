import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';

/**
 * Workix Menu Component
 *
 * Abstracted wrapper around PrimeNG Menu component.
 *
 * Usage:
 * ```html
 * <workix-menu [xPosition]="'before'" [yPosition]="'below'">
 *   <button workix-menu-trigger>Open Menu</button>
 *   <workix-menu-content>
 *     <workix-menu-item>Item 1</workix-menu-item>
 *     <workix-menu-item>Item 2</workix-menu-item>
 *   </workix-menu-content>
 * </workix-menu>
 * ```
 */
@Component({
  selector: 'workix-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class WorkixMenuComponent {
  // Optional inputs
  xPosition = input<'before' | 'after'>('after');
  yPosition = input<'above' | 'below'>('below');
  class = input<string>('');

  // Internal state
  isOpen = signal(false);

  // Computed
  menuClass = computed(() => {
    const baseClass = 'workix-menu';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });

  triggerClass = computed(() => 'workix-menu-trigger');
  menuPanelClass = computed(() => 'workix-menu-panel');

  toggleMenu(): void {
    this.isOpen.update((value) => !value);
  }
}
