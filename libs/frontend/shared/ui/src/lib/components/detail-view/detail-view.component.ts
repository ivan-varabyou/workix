import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { DetailViewConfig, DetailViewField } from './detail-view.component.types';

/**
 * Workix DetailView Component
 *
 * Generic component for displaying detail views with fields.
 * Replaces user-detail, role-detail, pipeline-detail, etc.
 *
 * Usage:
 * ```html
 * <workix-detail-view
 *   [config]="detailConfig"
 *   [isLoading]="isLoading()"
 *   (back)="goBack()"
 * />
 * ```
 */
@Component({
  selector: 'workix-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss'],
})
export class WorkixDetailViewComponent {
  // Required inputs
  config = input.required<DetailViewConfig>();
  isLoading = input<boolean>(false);

  // Optional inputs
  data = input<Record<string, unknown> | null>(null);
  errorMessage = input<string | null>(null);

  // Outputs
  back = output<void>();
  actionClick = output<{ action: string; data?: Record<string, unknown> }>();

  // Computed: Format field value
  formatFieldValue = (field: DetailViewField): string => {
    if (field.value === null || field.value === undefined) {
      return 'N/A';
    }

    switch (field.format) {
      case 'date':
        return new Date(field.value as string).toLocaleString();
      case 'boolean':
        return field.value ? 'Yes' : 'No';
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(field.value as number);
      case 'custom':
        return field.customFormatter ? field.customFormatter(field.value) : String(field.value);
      default:
        return String(field.value);
    }
  };

  handleBack(): void {
    this.back.emit();
  }

  handleAction(action: string, data?: Record<string, unknown>): void {
    const eventData: { action: string; data?: Record<string, unknown> } = { action };
    if (data !== undefined) {
      eventData.data = data;
    }
    this.actionClick.emit(eventData);
  }
}
