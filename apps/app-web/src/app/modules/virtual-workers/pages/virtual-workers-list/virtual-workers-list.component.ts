import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  DataTableAction,
  DataTableCellValue,
  DataTableColumn,
  DataTableConfig,
  DataTableRow,
  WorkixButtonComponent,
  WorkixChipComponent,
  WorkixDataTableComponent,
  WorkixIconComponent,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

import { VirtualWorker, VirtualWorkerService } from '../../services/virtual-worker.service';

@Component({
  selector: 'app-virtual-workers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WorkixDataTableComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixSpinnerComponent,
    WorkixChipComponent,
  ],
  templateUrl: './virtual-workers-list.component.html',
  styleUrl: './virtual-workers-list.component.scss',
})
export class VirtualWorkersListComponent implements OnInit {
  private workerService = inject(VirtualWorkerService);
  private router = inject(Router);

  // Dialog will be replaced with WorkixFormDialogComponent
  dialog: { close: (result?: Record<string, unknown>) => void } | null = null;

  workers = signal<VirtualWorker[]>([]);
  isLoading = signal(false);
  displayedColumns = ['name', 'type', 'status', 'metrics', 'actions'];

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        format: (value: DataTableCellValue, row?: DataTableRow) => {
          if (!row || typeof value !== 'string') {
            return String(value || '');
          }
          const workerType = row.type;
          const iconName =
            typeof workerType === 'string' ? this.getWorkerIcon(workerType) : 'worker';
          return `<div class="worker-name">
            <workix-icon name="${iconName}"></workix-icon>
            <span>${value}</span>
          </div>`;
        },
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        format: (value: DataTableCellValue) => String(value || 'UNKNOWN'),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        format: (value: DataTableCellValue) => String(value || 'UNKNOWN'),
      },
      {
        key: 'metrics',
        label: 'Performance',
        sortable: false,
        format: (_value: DataTableCellValue, row?: DataTableRow) => {
          if (!row || !row.metrics) {
            return 'No metrics yet';
          }
          const metrics = row.metrics;
          if (
            typeof metrics === 'object' &&
            metrics !== null &&
            'tasksCompleted' in metrics &&
            'successRate' in metrics
          ) {
            const tasksCompleted =
              typeof metrics.tasksCompleted === 'number' ? metrics.tasksCompleted : 0;
            const successRate = typeof metrics.successRate === 'number' ? metrics.successRate : 0;
            return `${tasksCompleted} tasks, ${(successRate * 100).toFixed(0)}% success`;
          }
          return 'No metrics yet';
        },
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'View',
        icon: 'visibility',
        color: 'primary',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id || '');
          this.viewWorker(id);
        },
      },
      {
        label: 'Assign Task',
        icon: 'assignment',
        color: 'primary',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id || '');
          this.assignTask(id);
        },
      },
      {
        label: 'Pause',
        icon: 'pause',
        color: 'warn',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id);
          this.pauseWorker(id);
        },
      },
      {
        label: 'Resume',
        icon: 'play_arrow',
        color: 'primary',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id);
          this.resumeWorker(id);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        color: 'warn',
        action: (row) => {
          const id = typeof row.id === 'string' ? row.id : String(row.id);
          this.deleteWorker(id);
        },
      },
    ];

    return {
      columns,
      actions,
      searchable: true,
      sortable: true,
      pagination: {
        pageSize: 10,
        pageSizeOptions: [5, 10, 25, 50],
      },
    };
  });

  ngOnInit(): void {
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.isLoading.set(true);
    this.workerService.list().subscribe({
      next: (data) => {
        this.workers.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load workers:', error);
        this.isLoading.set(false);
      },
    });
  }

  getWorkerIcon(type: string): string {
    const icons: Record<string, string> = {
      MARKETER: 'campaign',
      DESIGNER: 'palette',
      COPYWRITER: 'edit',
      ANALYST: 'analytics',
      CUSTOM: 'settings',
    };
    return icons[type] || 'work';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  openCreateDialog(): void {
    // TODO: Replace with WorkixFormDialogComponent
    // For now, just navigate to create page
    this.router.navigate(['/virtual-workers/create']);
  }

  viewWorker(id: string): void {
    this.router.navigate(['/virtual-workers', id]);
  }

  assignTask(workerId: string): void {
    // TODO: Open task assignment dialog
    this.router.navigate(['/virtual-workers', workerId], {
      queryParams: { action: 'assign' },
    });
  }

  pauseWorker(id: string): void {
    this.workerService.pause(id).subscribe({
      next: () => {
        this.loadWorkers();
      },
      error: (error) => {
        console.error('Failed to pause worker:', error);
        alert('Failed to pause worker');
      },
    });
  }

  resumeWorker(id: string): void {
    this.workerService.resume(id).subscribe({
      next: () => {
        this.loadWorkers();
      },
      error: (error) => {
        console.error('Failed to resume worker:', error);
        alert('Failed to resume worker');
      },
    });
  }

  deleteWorker(id: string): void {
    if (confirm('Are you sure you want to delete this virtual worker?')) {
      this.workerService.delete(id).subscribe({
        next: () => {
          this.loadWorkers();
        },
        error: (error) => {
          console.error('Failed to delete worker:', error);
          alert('Failed to delete worker');
        },
      });
    }
  }
}
