import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/**
 * Workix Toolbar Component
 *
 * Abstracted wrapper around PrimeNG Toolbar component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-toolbar
 *   color="primary"
 *   [position]="'static'"
 * >
 *   <span>Toolbar content</span>
 * </workix-toolbar>
 * ```
 */
@Component({
  selector: 'workix-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class WorkixToolbarComponent {
  // Optional inputs
  color = input<'primary' | 'accent' | 'warn' | undefined>(undefined);
  position = input<'static' | 'fixed' | 'sticky' | 'relative' | 'absolute'>('static');
  class = input<string>('');

  // Computed
  toolbarClass = computed(() => {
    const baseClass = 'workix-toolbar';
    const colorClass = this.color() ? `workix-toolbar-${this.color()}` : '';
    const positionClass = `workix-toolbar-${this.position()}`;
    const customClass = this.class();
    return [baseClass, colorClass, positionClass, customClass].filter(Boolean).join(' ');
  });
}
