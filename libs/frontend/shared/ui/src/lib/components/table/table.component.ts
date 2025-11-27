import { CommonModule } from '@angular/common';
import { Component, input, output, TemplateRef } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import {
  TableLazyLoadEvent,
  TableRowSelectEvent,
  TableSelectionChangeEvent,
  TableSortEvent,
} from '../../interfaces/table.interface';

/**
 * Workix Table Component
 *
 * Abstracted wrapper around PrimeNG Table component.
 *
 * Usage:
 * ```html
 * <workix-table
 *   [data]="items()"
 *   [columns]="columns()"
 *   [paginator]="true"
 *   [rows]="10"
 *   (rowSelect)="handleRowSelect($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-table',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class WorkixTableComponent {
  data = input<unknown[]>([]);
  columns = input<
    Array<{ field: string; header: string; sortable?: boolean; template?: TemplateRef<unknown> }>
  >([]);
  paginator = input<boolean>(false);
  rows = input<number>(10);
  rowsPerPageOptions = input<number[]>([10, 25, 50, 100]);
  sortMode = input<'single' | 'multiple'>('single');
  sortField = input<string | undefined>(undefined);
  sortOrder = input<number | undefined>(undefined);
  selectionMode = input<'single' | 'multiple' | undefined>(undefined);
  selection = input<unknown | unknown[] | undefined>(undefined);
  loading = input<boolean>(false);
  lazy = input<boolean>(false);
  scrollable = input<boolean>(false);
  scrollHeight = input<string | undefined>(undefined);
  styleClass = input<string>('');

  rowSelect = output<TableRowSelectEvent>();
  rowUnselect = output<TableRowSelectEvent>();
  selectionChange = output<TableSelectionChangeEvent>();
  sort = output<TableSortEvent>();
  lazyLoad = output<TableLazyLoadEvent>();

  onRowSelect(event: TableRowSelectEvent): void {
    this.rowSelect.emit(event);
  }

  onRowUnselect(event: TableRowSelectEvent): void {
    this.rowUnselect.emit(event);
  }

  onSelectionChange(event: TableSelectionChangeEvent): void {
    this.selectionChange.emit(event);
  }

  onSort(event: TableSortEvent): void {
    this.sort.emit(event);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }
}
