import { Directive, input } from '@angular/core';

/**
 * Workix Tooltip Directive
 *
 * Abstracted wrapper around PrimeNG Tooltip directive.
 * Uses Angular 2025 signals.
 *
 * Usage:
 * ```html
 * <button
 *   pTooltip="Tooltip text"
 *   tooltipPosition="top"
 * >
 *   Hover me
 * </button>
 * ```
 *
 * Note: This is a wrapper directive that uses PrimeNG's pTooltip directly.
 * For more complex tooltips, use PrimeNG's TooltipModule directly.
 */
@Directive({
  selector: '[workixTooltip]',
  standalone: true,
  host: {
    '[pTooltip]': 'tooltip()',
    '[tooltipPosition]': 'position()',
    '[tooltipShowDelay]': 'showDelay()',
    '[tooltipHideDelay]': 'hideDelay()',
    '[tooltipStyleClass]': 'styleClass()',
  },
})
export class WorkixTooltipDirective {
  tooltip = input<string>('');
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  showDelay = input<number>(0);
  hideDelay = input<number>(0);
  styleClass = input<string>('');
}
