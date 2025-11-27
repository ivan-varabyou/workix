import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

/**
 * Workix Sidenav Component
 *
 * Abstracted wrapper around PrimeNG Sidenav component.
 * Supports PrimeNG provider.
 *
 * Usage:
 * ```html
 * <workix-sidenav-container>
 *   <workix-sidenav [mode]="'side'" [opened]="true">
 *     <workix-list>
 *       <workix-list-item>Item 1</workix-list-item>
 *     </workix-list>
 *   </workix-sidenav>
 *   <workix-sidenav-content>
 *     Main content
 *   </workix-sidenav-content>
 * </workix-sidenav-container>
 * ```
 */
@Component({
  selector: 'workix-sidenav-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav-container.component.html',
  styleUrls: ['./sidenav-container.component.scss'],
})
export class WorkixSidenavContainerComponent {
  // Optional inputs
  autosize = input<boolean>(true);
  class = input<string>('');

  // Computed
  containerClass = computed(() => {
    const baseClass = 'workix-sidenav-container';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });
}

@Component({
  selector: 'workix-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class WorkixSidenavComponent {
  // Optional inputs
  mode = input<'over' | 'push' | 'side'>('side');
  opened = input<boolean>(false);
  position = input<'start' | 'end'>('start');
  fixedInViewport = input<boolean>(false);
  fixedTopGap = input<number>(0);
  fixedBottomGap = input<number>(0);
  class = input<string>('');

  // Outputs
  openedChange = output<boolean>();

  // Computed
  sidenavClass = computed(() => {
    const baseClass = 'workix-sidenav';
    const modeClass = `workix-sidenav-${this.mode()}`;
    const customClass = this.class();
    return [baseClass, modeClass, customClass].filter(Boolean).join(' ');
  });

  handleOpenedChange(opened: boolean): void {
    this.openedChange.emit(opened);
  }

  toggle(): void {
    this.openedChange.emit(!this.opened());
  }
}

@Component({
  selector: 'workix-sidenav-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav-content.component.html',
  styleUrls: ['./sidenav-content.component.scss'],
})
export class WorkixSidenavContentComponent {
  // Optional inputs
  class = input<string>('');

  // Computed
  contentClass = computed(() => {
    const baseClass = 'workix-sidenav-content';
    const customClass = this.class();
    return [baseClass, customClass].filter(Boolean).join(' ');
  });
}
