import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TabsModule } from 'primeng/tabs';

/**
 * Workix Tabs Component
 *
 * Abstracted wrapper around PrimeNG Tabs component.
 * Uses Angular 2025 signals and new control flow.
 *
 * Usage:
 * ```html
 * <workix-tabs
 *   [activeIndex]="0"
 *   (activeIndexChange)="handleTabChange($event)"
 * >
 *   <p-tabPanel header="Tab 1">
 *     Content 1
 *   </p-tabPanel>
 *   <p-tabPanel header="Tab 2">
 *     Content 2
 *   </p-tabPanel>
 * </workix-tabs>
 * ```
 */
@Component({
  selector: 'workix-tabs',
  standalone: true,
  imports: [CommonModule, TabsModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class WorkixTabsComponent {
  activeIndex = input<number>(0);
  scrollable = input<boolean>(false);
  styleClass = input<string>('');

  activeIndexChange = output<number>();

  onTabChange(event: { index: number }): void {
    this.activeIndexChange.emit(event.index);
  }
}
