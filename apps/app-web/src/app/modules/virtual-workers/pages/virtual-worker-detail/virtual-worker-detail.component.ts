import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  DataTableAction,
  DataTableCellValue,
  DataTableColumn,
  DataTableConfig,
  WorkixButtonComponent,
  WorkixCardComponent,
  WorkixChipComponent,
  WorkixDataTableComponent,
  WorkixDetailViewComponent,
  WorkixIconComponent,
  WorkixSpinnerComponent,
  WorkixTabsComponent,
} from '@workix/shared/frontend/ui';

import { VirtualWorker, VirtualWorkerService } from '../../services/virtual-worker.service';

@Component({
  selector: 'app-virtual-worker-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixTabsComponent,
    WorkixDataTableComponent,
    WorkixChipComponent,
    WorkixSpinnerComponent,
    WorkixDetailViewComponent,
  ],
  templateUrl: './virtual-worker-detail.component.html',
  styleUrl: './virtual-worker-detail.component.scss',
})
export class VirtualWorkerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workerService = inject(VirtualWorkerService);

  worker = signal<VirtualWorker | null>(null);
  tasks = signal<any[]>([]);
  isLoading = signal(false);
  taskColumns = ['taskType', 'status', 'createdAt', 'actions'];

  // Computed: Build tasks table config
  tasksTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      { key: 'taskType', label: 'Task Type', sortable: true },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        format: (value: DataTableCellValue) => String(value || 'UNKNOWN'),
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        type: 'date',
        format: (value: DataTableCellValue) => {
          if (!value) {
            return '-';
          }
          const dateValue = value instanceof Date ? value : new Date(String(value));
          return dateValue.toLocaleString();
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
          // Navigate to task detail or show task info
          console.log('View task:', id);
        },
      },
    ];

    return {
      columns,
      actions,
      searchable: false,
      sortable: true,
      pagination: {
        pageSize: 10,
        pageSizeOptions: [5, 10, 25],
      },
    };
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadWorker(id);
        this.loadTasks(id);
      }
    });
  }

  loadWorker(id: string): void {
    this.isLoading.set(true);
    this.workerService.get(id).subscribe({
      next: (data) => {
        this.worker.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load worker:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadTasks(id: string): void {
    this.workerService.getTasks(id).subscribe({
      next: (data) => {
        this.tasks.set(data);
      },
      error: (error) => {
        console.error('Failed to load tasks:', error);
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

  formatConfig(config: Record<string, any>): string {
    return JSON.stringify(config, null, 2);
  }

  goBack(): void {
    this.router.navigate(['/virtual-workers']);
  }

  pauseWorker(): void {
    const worker = this.worker();
    if (!worker) return;

    this.workerService.pause(worker.id).subscribe({
      next: () => {
        this.loadWorker(worker.id);
      },
      error: (error) => {
        console.error('Failed to pause worker:', error);
        alert('Failed to pause worker');
      },
    });
  }

  resumeWorker(): void {
    // Resume worker logic
  }
}
