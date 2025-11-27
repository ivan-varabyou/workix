import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Pipeline } from '@workix/shared/frontend/core';
import {
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  DataTableRow,
  WorkixButtonComponent,
  WorkixCardComponent,
  WorkixDataTableComponent,
  WorkixIconComponent,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-pipeline-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixSpinnerComponent,
    WorkixDataTableComponent,
  ],
  templateUrl: './pipeline-list.component.html',
  styleUrls: ['./pipeline-list.component.scss'],
})
export class PipelineListComponent {
  // Inputs
  readonly initialPipelines = input<Pipeline[]>([]);

  // Outputs
  readonly pipelineCreated = output<void>();
  readonly pipelineEdited = output<Pipeline>();

  // Signals
  pipelines = signal<Pipeline[]>([]);
  isLoading = signal(false);
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  searchTerm = signal('');
  currentPage = signal(0);
  currentPageSize = signal(10);

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      { key: 'name', label: 'Name', sortable: true, type: 'text' },
      {
        key: 'description',
        label: 'Description',
        sortable: false,
        type: 'text',
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        type: 'text',
        format: (value) => {
          if (value === 'active') return 'Active';
          if (value === 'inactive') return 'Inactive';
          if (value === 'draft') return 'Draft';
          return String(value || 'Unknown');
        },
      },
      {
        key: 'updatedAt',
        label: 'Last Updated',
        sortable: true,
        type: 'date',
        format: (value) => {
          if (!value) return 'Never';
          const date = value instanceof Date ? value : new Date(String(value));
          return date.toLocaleString();
        },
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'View',
        icon: 'visibility',
        color: 'primary',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id);
          this.onViewPipeline(id);
        },
      },
      {
        label: 'Edit',
        icon: 'edit',
        color: 'primary',
        action: (row) => {
          if (this.isPipeline(row)) {
            this.onEditPipeline(row);
          }
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id);
          this.removePipeline(id);
        },
      },
    ];

    return {
      title: 'Pipelines',
      columns,
      actions,
      pageSize: this.currentPageSize(),
      pageSizeOptions: [5, 10, 25, 50],
      showPagination: true,
      showSearch: true,
      searchPlaceholder: 'Search pipelines...',
    };
  });

  // Computed
  displayedPipelines = computed(() => {
    const pipelines = this.pipelines();
    const filter = this.filterStatus();
    const search = this.searchTerm().toLowerCase();

    let filtered = pipelines;
    if (filter !== 'all') {
      filtered = pipelines.filter((p) => {
        const status = p.status || 'draft';
        return status === filter;
      });
    }
    if (search) {
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }
    return filtered;
  });

  pipelineCount = computed(() => this.pipelines().length);
  activeCount = computed(
    () => this.pipelines().filter((p) => (p.status || 'draft') === 'active').length
  );
  inactiveCount = computed(
    () => this.pipelines().filter((p) => (p.status || 'draft') === 'inactive').length
  );
  isEmpty = computed(() => this.pipelineCount() === 0);

  constructor() {
    this.pipelines.set(this.initialPipelines());
  }

  onCreatePipeline(): void {
    this.pipelineCreated.emit();
  }

  onViewPipeline(pipelineId: string): void {
    // Navigate to pipeline detail
    console.log('View pipeline:', pipelineId);
  }

  onEditPipeline(pipeline: Pipeline): void {
    this.pipelineEdited.emit(pipeline);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onPageChange(page: number, pageSize: number): void {
    this.currentPage.set(page);
    this.currentPageSize.set(pageSize);
  }

  onSortChange(sortKey: string, sortDirection: 'asc' | 'desc'): void {
    // Handle sorting if needed
    console.log('Sort changed:', sortKey, sortDirection);
  }

  onActionClick(action: DataTableAction, row: DataTableRow): void {
    // Actions are handled directly in the config
    if (action.action) {
      action.action(row);
    }
  }

  private isPipeline(row: unknown): row is Pipeline {
    return (
      typeof row === 'object' &&
      row !== null &&
      'id' in row &&
      'name' in row &&
      typeof (row as Record<string, unknown>).id === 'string'
    );
  }

  setFilterStatus(status: 'all' | 'active' | 'inactive'): void {
    this.filterStatus.set(status);
  }

  addPipeline(pipeline: Pipeline): void {
    this.pipelines.update((pipes) => [...pipes, pipeline]);
  }

  removePipeline(pipelineId: string): void {
    this.pipelines.update((pipes) => pipes.filter((p) => p.id !== pipelineId));
  }

  updatePipeline(pipelineId: string, changes: Partial<Pipeline>): void {
    this.pipelines.update((pipes) =>
      pipes.map((p) => (p.id === pipelineId ? { ...p, ...changes } : p))
    );
  }
}
