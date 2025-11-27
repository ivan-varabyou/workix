import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Pipeline } from '@workix/shared/frontend/core';
import {
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  DataTableRow,
  WorkixButtonComponent,
  WorkixDataTableComponent,
  WorkixSnackbarService,
} from '@workix/shared/frontend/ui';

import { PipelineService } from '../../services/pipeline.service';

// Type guard for Pipeline
function isPipeline(value: unknown): value is Pipeline {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const nameDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'name');
  const descDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
    value,
    'description'
  );
  return typeof nameDesc?.value === 'string' && typeof descDesc?.value === 'string';
}

// Helper to safely get property from object
function getProperty(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object' || obj === null) return undefined;
  if (Array.isArray(obj)) return undefined;
  const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
  return desc?.value;
}

@Component({
  selector: 'app-pipeline-list',
  standalone: true,
  imports: [CommonModule, DatePipe, WorkixDataTableComponent, WorkixButtonComponent],
  templateUrl: './pipeline-list.component.html',
  styleUrl: './pipeline-list.component.scss',
})
export class PipelineListComponent implements OnInit {
  private router = inject(Router);
  private pipelineService = inject(PipelineService);
  private snackbar = inject(WorkixSnackbarService);

  // Signals
  pipelines = signal<Pipeline[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  currentPage = signal(0);
  currentPageSize = signal(10);
  totalPipelines = signal(0);

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      { key: 'name', label: 'Name', sortable: true },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        format: (value) => String(value).toUpperCase(),
      },
      { key: 'stepsCount', label: 'Steps', sortable: true },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        format: (value) => {
          if (!value) return '-';
          try {
            return new Date(String(value)).toLocaleDateString();
          } catch {
            return String(value);
          }
        },
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'Edit',
        icon: 'edit',
        color: 'primary',
        action: (row) => {
          if (!row || !isPipeline(row)) return;
          this.editPipeline(row);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          if (!row || !isPipeline(row)) return;
          this.deletePipeline(row);
        },
      },
    ];

    return {
      columns,
      actions,
      searchable: true,
      sortable: true,
      pagination: {
        pageSize: this.currentPageSize(),
        pageSizeOptions: [5, 10, 25, 50],
      },
    };
  });

  ngOnInit(): void {
    this.loadPipelines();
  }

  loadPipelines(): void {
    this.isLoading.set(true);
    this.pipelineService.getPipelines().subscribe({
      next: (data) => {
        this.pipelines.set(data || []);
        this.totalPipelines.set(data?.length || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pipelines:', err);
        this.snackbar.open('Error loading pipelines', undefined, {
          panelClass: 'error',
        });
        this.isLoading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    // TODO: Implement server-side search if needed
    this.loadPipelines();
  }

  onPageChange(page: number, pageSize: number): void {
    this.currentPage.set(page);
    this.currentPageSize.set(pageSize);
    // TODO: Implement server-side pagination if needed
    this.loadPipelines();
  }

  onSortChange(sortKey: string, sortDirection: 'asc' | 'desc'): void {
    // TODO: Implement server-side sorting if needed
    const sorted = [...this.pipelines()].sort((a, b) => {
      const aVal = getProperty(a, sortKey);
      const bVal = getProperty(b, sortKey);
      if (aVal === undefined || bVal === undefined) return 0;
      const aStr = String(aVal);
      const bStr = String(bVal);
      if (sortDirection === 'asc') {
        return aStr > bStr ? 1 : -1;
      } else {
        return aStr < bStr ? 1 : -1;
      }
    });
    this.pipelines.set(sorted);
  }

  onActionClick(action: DataTableAction, row: DataTableRow): void {
    action.action(row);
  }

  createNewPipeline(): void {
    this.router.navigate(['/pipelines/builder']);
  }

  editPipeline(pipeline: Pipeline): void {
    if (pipeline.id) {
      this.router.navigate(['/pipelines/builder', pipeline.id]);
    }
  }

  deletePipeline(pipeline: Pipeline): void {
    // TODO: Use WorkixConfirmDialogComponent instead of confirm
    if (!pipeline.id) return;
    if (confirm(`Are you sure you want to delete "${pipeline.name}"?`)) {
      this.pipelineService.deletePipeline(pipeline.id).subscribe({
        next: () => {
          this.snackbar.open('Pipeline deleted successfully', undefined, {
            panelClass: 'success',
          });
          this.loadPipelines();
        },
        error: (err) => {
          console.error('Error deleting pipeline:', err);
          this.snackbar.open('Error deleting pipeline', undefined, {
            panelClass: 'error',
          });
        },
      });
    }
  }
}
