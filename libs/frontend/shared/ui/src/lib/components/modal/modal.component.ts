import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

/**
 * Workix Modal Component
 *
 * Abstracted wrapper around PrimeNG Dialog component.
 *
 * Usage:
 * ```html
 * <workix-modal
 *   [visible]="isOpen()"
 *   [title]="'Modal Title'"
 *   [closable]="true"
 *   (visibleChange)="isOpen.set($event)"
 * >
 *   <ng-content></ng-content>
 * </workix-modal>
 * ```
 */
@Component({
  selector: 'workix-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class WorkixModalComponent {
  visible = input<boolean>(false);
  title = input<string>('Modal');
  message = input<string>('Are you sure?');
  modal = input<boolean>(true);
  closable = input<boolean>(true);
  draggable = input<boolean>(false);
  resizable = input<boolean>(false);
  style = input<string>('');
  styleClass = input<string>('');
  width = input<string>('50vw');
  height = input<string>('auto');
  position = input<
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  >('center');
  showFooter = input<boolean>(true);
  cancelLabel = input<string>('Cancel');
  confirmLabel = input<string>('Confirm');

  visibleChange = output<boolean>();
  onConfirm = output<void>();
  onCancelEvent = output<void>();
  onConfirmEvent = output<void>();

  onHide(): void {
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    this.onCancelEvent.emit();
    this.visibleChange.emit(false);
  }

  onConfirmClick(): void {
    this.onConfirmEvent.emit();
    this.onConfirm.emit();
  }
}
