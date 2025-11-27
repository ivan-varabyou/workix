import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';

/**
 * Workix Snackbar Component
 *
 * Abstracted wrapper around PrimeNG Snackbar component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-snackbar
 *   [message]="'Message'"
 *   [action]="'Action'"
 *   [duration]="3000"
 *   [open]="true"
 *   (actionClick)="handleAction()"
 *   (dismiss)="handleDismiss()"
 * />
 * ```
 */
@Component({
  selector: 'workix-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class WorkixSnackbarComponent {
  // Required inputs
  message = input<string>('');

  // Optional inputs
  action = input<string | undefined>(undefined);
  duration = input<number>(3000);
  open = input<boolean>(false);
  horizontalPosition = input<'start' | 'center' | 'end' | 'left' | 'right'>('center');
  verticalPosition = input<'top' | 'bottom'>('bottom');
  class = input<string>('');

  // Outputs
  actionClick = output<void>();
  dismiss = output<void>();

  // Internal state
  isOpen = signal(false);

  // Computed
  snackbarClass = computed(() => {
    const baseClass = 'workix-snackbar';
    const positionClass = `workix-snackbar-${this.horizontalPosition()}-${this.verticalPosition()}`;
    const customClass = this.class();
    return [baseClass, positionClass, customClass].filter(Boolean).join(' ');
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.isOpen.set(true);
        if (this.duration() > 0) {
          setTimeout(() => {
            this.isOpen.set(false);
            this.dismiss.emit();
          }, this.duration());
        }
      } else {
        this.isOpen.set(false);
      }
    });
  }

  handleAction(): void {
    this.actionClick.emit();
  }

  handleDismiss(): void {
    this.isOpen.set(false);
    this.dismiss.emit();
  }
}
