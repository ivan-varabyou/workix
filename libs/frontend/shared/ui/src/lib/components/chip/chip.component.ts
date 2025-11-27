import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ChipModule } from 'primeng/chip';

/**
 * Workix Chip Component
 *
 * Abstracted wrapper around PrimeNG Chip component.
 * Uses Angular 2025 signals.
 *
 * Usage:
 * ```html
 * <workix-chip
 *   [label]="'Label'"
 *   [removable]="true"
 *   (onRemove)="handleRemove()"
 * />
 * ```
 */
@Component({
  selector: 'workix-chip',
  standalone: true,
  imports: [CommonModule, ChipModule],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class WorkixChipComponent {
  label = input<string>('');
  removable = input<boolean>(false);
  styleClass = input<string>('');

  onRemove = output<void>();

  handleRemove(): void {
    this.onRemove.emit();
  }
}
