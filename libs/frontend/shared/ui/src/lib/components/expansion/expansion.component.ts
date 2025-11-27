import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

/**
 * Workix Expansion Panel Component
 *
 * Abstracted wrapper around PrimeNG Expansion Panel component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-expansion-panel
 *   [expanded]="false"
 *   [disabled]="false"
 *   (opened)="handleOpened()"
 *   (closed)="handleClosed()"
 * >
 *   <workix-expansion-panel-header>
 *     <workix-expansion-panel-title>Title</workix-expansion-panel-title>
 *   </workix-expansion-panel-header>
 *   <workix-expansion-panel-content>
 *     Content
 *   </workix-expansion-panel-content>
 * </workix-expansion-panel>
 * ```
 */
@Component({
  selector: 'workix-expansion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss'],
})
export class WorkixExpansionPanelComponent {
  // Optional inputs
  expanded = input<boolean>(false);
  disabled = input<boolean>(false);
  hideToggle = input<boolean>(false);
  class = input<string>('');

  // Outputs
  opened = output<void>();
  closed = output<void>();

  // Computed
  panelClass = computed(() => {
    const baseClass = 'workix-expansion-panel';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });

  headerClass = computed(() => 'workix-expansion-panel-header');
  contentClass = computed(() => 'workix-expansion-panel-content');
  iconClass = computed(() => 'workix-expansion-panel-icon');

  toggle(): void {
    if (!this.disabled()) {
      if (this.expanded()) {
        this.closed.emit();
      } else {
        this.opened.emit();
      }
    }
  }

  handleOpened(): void {
    this.opened.emit();
  }

  handleClosed(): void {
    this.closed.emit();
  }
}

@Component({
  selector: 'workix-expansion-panel-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-panel-header.component.html',
  styleUrls: ['./expansion-panel-header.component.scss'],
})
export class WorkixExpansionPanelHeaderComponent {}

@Component({
  selector: 'workix-expansion-panel-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-panel-title.component.html',
  styleUrls: ['./expansion-panel-title.component.scss'],
})
export class WorkixExpansionPanelTitleComponent {}

@Component({
  selector: 'workix-expansion-panel-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-panel-content.component.html',
  styleUrls: ['./expansion-panel-content.component.scss'],
})
export class WorkixExpansionPanelContentComponent {}
