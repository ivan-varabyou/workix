import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Workix Button Component
 *
 * Abstracted wrapper around PrimeNG Button component.
 * This allows for easy UI library replacement without changing application code.
 *
 * Usage:
 * ```html
 * <workix-button
 *   label="Click me"
 *   variant="primary"
 *   size="md"
 *   [disabled]="false"
 *   (onClick)="handleClick()"
 * />
 * ```
 */
@Component({
  selector: 'workix-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class WorkixButtonComponent {
  // Required inputs
  label = input<string>('Click me');

  // Optional inputs with defaults
  variant = input<'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help'>(
    'primary'
  );
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  icon = input<string | undefined>(undefined);
  iconPos = input<'left' | 'right' | 'top' | 'bottom'>('left');
  rounded = input<boolean>(false);
  outlined = input<boolean>(false);
  text = input<boolean>(false);
  raised = input<boolean>(false);
  link = input<boolean>(false);
  styleClass = input<string>('');

  // Outputs
  onClick = output<void>();

  // Computed: Map variant to PrimeNG severity
  severity = computed(() => {
    const variantMap: Record<string, string> = {
      primary: 'primary',
      secondary: 'secondary',
      success: 'success',
      info: 'info',
      warning: 'warn',
      danger: 'danger',
      help: 'help',
    };
    return variantMap[this.variant()] || 'primary';
  });

  // Computed: Map size to PrimeNG size
  sizeComputed = computed(() => {
    const sizeMap: Record<string, string> = {
      sm: 'small',
      md: 'medium',
      lg: 'large',
    };
    return sizeMap[this.size()] || 'medium';
  });

  handleClick(_event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.onClick.emit();
    }
  }
}
