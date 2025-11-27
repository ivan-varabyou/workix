import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import type { AuditLog } from '@workix/shared/frontend/core';
import {
  DataTableAction,
  DataTableColumn,
  DataTableConfig,
  WorkixButtonComponent,
  WorkixDataTableComponent,
} from '@workix/shared/frontend/ui';

import { AuditLogService } from '../../services/audit-log.service';
// Note: AuditLogDetailComponent will be created later or replaced with WorkixDetailViewComponent

// Type guard for AuditLog
function isAuditLog(value: unknown): value is AuditLog {
  if (!value || typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  const idDesc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(value, 'id');
  return typeof idDesc?.value === 'string';
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, WorkixDataTableComponent, WorkixButtonComponent],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
})
export class AuditLogsComponent implements OnInit {
  // Signals
  auditLogs = signal<AuditLog[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  currentPage = signal<number>(0);
  currentPageSize = signal<number>(10);
  totalLogs = signal<number>(0);

  filters = signal<{
    userId: string;
    action: string;
    entityType: string;
    startDate: string;
    endDate: string;
  }>({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  actions = signal<string[]>([]);
  entityTypes = signal<string[]>([]);

  // Computed: Build data table config
  dataTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      {
        key: 'timestamp',
        label: 'Timestamp',
        sortable: true,
        format: (value) => new Date(value as string).toLocaleString(),
      },
      { key: 'user', label: 'User', sortable: true },
      { key: 'action', label: 'Action', sortable: true },
      { key: 'entityType', label: 'Entity Type', sortable: true },
      { key: 'entityId', label: 'Entity ID', sortable: false },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        format: (value) => String(value).toUpperCase(),
      },
    ];

    const actions: DataTableAction[] = [
      {
        label: 'View',
        icon: 'visibility',
        color: 'primary',
        action: (row) => {
          if (!row || !isAuditLog(row)) return;
          this.viewDetail(row);
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

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadAuditLogs();
  }

  loadFilters(): void {
    this.auditLogService.getActions().subscribe((data: string[]) => {
      this.actions.set(data || []);
    });

    this.auditLogService.getEntityTypes().subscribe((data: string[]) => {
      this.entityTypes.set(data || []);
    });
  }

  loadAuditLogs(): void {
    this.isLoading.set(true);
    const skip = this.currentPage() * this.currentPageSize();
    const take = this.currentPageSize();

    this.auditLogService.getAuditLogs(skip, take, this.filters()).subscribe({
      next: (response) => {
        this.auditLogs.set(response.data || []);
        this.totalLogs.set(response.total || 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.filters.set({
      userId: '',
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    });
    this.currentPage.set(0);
    this.loadAuditLogs();
  }

  viewDetail(log: AuditLog): void {
    // TODO: Use WorkixDetailViewComponent or WorkixFormDialogComponent instead of MatDialog
    console.log('View detail:', log);
  }

  exportLogs(format: 'csv' | 'json'): void {
    this.auditLogService.exportAuditLogs(format, this.filters()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting logs:', error);
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'success';
      case 'failure':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }
}
