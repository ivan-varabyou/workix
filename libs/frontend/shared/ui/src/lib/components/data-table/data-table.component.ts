import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixInputComponent } from '../input/input.component';
import { WorkixPaginatorComponent } from '../paginator/paginator.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import {
  DataTableAction,
  DataTableCellValue,
  DataTableColumn,
  DataTableConfig,
  DataTableRow,
} from './data-table.component.types';

@Component({
  selector: 'workix-data-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WorkixPaginatorComponent,
    WorkixInputComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class WorkixDataTableComponent implements OnInit {
  // Inputs
  config = input.required<DataTableConfig>();
  data = input<DataTableRow[]>([]);
  isLoading = input<boolean>(false);
  searchTerm = input<string>('');

  // Outputs
  search = output<string>();
  pageChange = output<{ page: number; pageSize: number }>();
  sortChange = output<{ column: string; direction: 'asc' | 'desc' }>();
  actionClick = output<{ action: string; row: DataTableRow }>();

  // Internal state
  currentPage = signal(0);
  currentPageSize = signal(10);
  currentSort = signal<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  // Computed
  displayedData = computed(() => {
    let result = [...this.data()];

    // Apply search
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter((row) => {
        return this.config().columns.some((col) => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(search);
        });
      });
    }

    // Apply sort
    const sort = this.currentSort();
    if (sort) {
      result.sort((a, b) => {
        const aVal: DataTableCellValue = a[sort.column];
        const bVal: DataTableCellValue = b[sort.column];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const comparison: number = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    const start = this.currentPage() * this.currentPageSize();
    const end = start + this.currentPageSize();
    return result.slice(start, end);
  });

  totalItems = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (search) {
      return this.data().filter((row) => {
        return this.config().columns.some((col) => {
          const value = row[col.key];
          return value?.toString().toLowerCase().includes(search);
        });
      }).length;
    }
    return this.data().length;
  });

  ngOnInit(): void {
    const pageSize: number | undefined = this.config().pageSize;
    if (pageSize !== undefined) {
      this.currentPageSize.set(pageSize);
    }
  }

  onSearch(term: string): void {
    this.search.emit(term);
    this.currentPage.set(0);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
    this.pageChange.emit({ page: event.pageIndex, pageSize: event.pageSize });
  }

  onSort(column: string): void {
    const currentSort = this.currentSort();
    let direction: 'asc' | 'desc' = 'asc';

    if (currentSort?.column === column) {
      direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    this.currentSort.set({ column, direction });
    this.sortChange.emit({ column, direction });
  }

  onActionClick(action: DataTableAction, row: DataTableRow): void {
    this.actionClick.emit({ action: action.label, row });
    action.action(row);
  }

  formatCellValue(column: DataTableColumn, value: DataTableCellValue, row?: DataTableRow): string {
    if (column.format) {
      return column.format(value, row);
    }

    if (column.type === 'date' && value) {
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        return new Date(value).toLocaleDateString();
      }
      return String(value);
    }

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value?.toString() || '';
  }
}
