import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

/**
 * Workix Card Component
 *
 * Abstracted wrapper around PrimeNG Card component.
 *
 * Usage:
 * ```html
 * <workix-card
 *   [title]="'Card Title'"
 *   [subtitle]="'Subtitle'"
 *   [styleClass]="'custom-class'"
 * >
 *   <ng-content></ng-content>
 * </workix-card>
 * ```
 */
@Component({
  selector: 'workix-card',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class WorkixCardComponent {
  title = input<string | undefined>(undefined);
  subtitle = input<string | undefined>(undefined);
  styleClass = input<string>('');
}
