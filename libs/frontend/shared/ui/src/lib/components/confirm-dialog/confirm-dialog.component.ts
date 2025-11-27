import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixModalComponent } from '../modal/modal.component';
import { ConfirmDialogConfig } from './confirm-dialog.component.types';

/**
 * Workix ConfirmDialog Component
 *
 * Generic component for confirmation dialogs.
 * Replaces user-delete-dialog, provider-credentials, etc.
 *
 * Usage:
 * ```html
 * <workix-confirm-dialog
 *   [visible]="isOpen()"
 *   [config]="confirmConfig"
 *   [isLoading]="isLoading()"
 *   (confirm)="onConfirm()"
 *   (cancel)="onCancel()"
 *   (visibleChange)="isOpen.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-confirm-dialog',
  standalone: true,
  imports: [CommonModule, WorkixModalComponent, WorkixButtonComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class WorkixConfirmDialogComponent {
  // Required inputs
  visible = input<boolean>(false);
  config = input.required<ConfirmDialogConfig>();

  // Optional inputs
  isLoading = input<boolean>(false);

  // Outputs
  confirm = output<void>();
  cancel = output<void>();
  visibleChange = output<boolean>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  onModalClose(): void {
    this.visibleChange.emit(false);
  }
}
