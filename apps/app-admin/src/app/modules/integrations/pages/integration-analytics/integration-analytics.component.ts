import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import {
  DashboardConfig,
  DashboardStat,
  DataTableColumn,
  DataTableConfig,
  WorkixButtonComponent,
  WorkixChipComponent,
  WorkixDashboardComponent,
  WorkixDataTableComponent,
  WorkixIconComponent,
  WorkixListComponent,
  WorkixListItemComponent,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

import { IntegrationService } from '../../services/integration.service';

@Component({
  selector: 'app-integration-analytics',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    WorkixDashboardComponent,
    WorkixDataTableComponent,
    WorkixButtonComponent,
    WorkixSpinnerComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixIconComponent,
    WorkixChipComponent,
  ],
  templateUrl: './integration-analytics.component.html',
  styleUrl: './integration-analytics.component.scss',
})
export class IntegrationAnalyticsComponent implements OnInit {
  dashboardData = signal<any>(null);
  alerts = signal<any>(null);
  selectedPeriod = signal<'1h' | '24h' | '7d' | '30d'>('24h');
  isLoading = signal(false);
  providerColumns = ['providerName', 'calls', 'successRate', 'avgLatency', 'totalCost'];

  // Computed: Build dashboard config
  dashboardConfig = computed<DashboardConfig>(() => {
    const data = this.dashboardData();
    if (!data) {
      return {
        title: 'Integration Analytics',
        stats: [],
      };
    }

    const summary = data.summary || data;
    const stats: DashboardStat[] = [
      {
        title: 'Total Calls',
        value: this.formatNumber(summary.totalCalls || 0),
        icon: 'call',
        color: 'primary',
      },
      {
        title: 'Success Rate',
        value: `${this.formatPercent(summary.successRate || 0)}%`,
        icon: 'check_circle',
        color: 'success',
      },
      {
        title: 'Avg Latency',
        value: `${this.formatNumber(summary.avgLatency || 0)}ms`,
        icon: 'speed',
        color: 'info',
      },
      {
        title: 'Total Cost',
        value: `$${this.formatCost(summary.totalCost || 0)}`,
        icon: 'attach_money',
        color: 'warning',
      },
    ];

    return {
      title: 'Integration Analytics',
      stats,
    };
  });

  // Computed: Build provider table config
  providerTableConfig = computed<DataTableConfig>(() => {
    const columns: DataTableColumn[] = [
      { key: 'providerName', label: 'Provider', sortable: true },
      { key: 'calls', label: 'Calls', sortable: true },
      {
        key: 'successRate',
        label: 'Success Rate',
        sortable: true,
        format: (value) => `${this.formatPercent(value as number)}%`,
      },
      {
        key: 'avgLatency',
        label: 'Avg Latency',
        sortable: true,
        format: (value) => `${this.formatNumber(value as number)}ms`,
      },
      {
        key: 'totalCost',
        label: 'Total Cost',
        sortable: true,
        format: (value) => `$${this.formatCost(value as number)}`,
      },
    ];

    return {
      columns,
      searchable: true,
      sortable: true,
    };
  });

  constructor(private integrationService: IntegrationService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAlerts();
  }

  onPeriodChange(period: '1h' | '24h' | '7d' | '30d'): void {
    this.selectedPeriod.set(period);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.integrationService.getDashboardData(this.selectedPeriod()).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadAlerts(): void {
    this.integrationService.getAlerts().subscribe({
      next: (data) => {
        this.alerts.set(data);
      },
      error: (error) => {
        console.error('Failed to load alerts:', error);
      },
    });
  }

  formatPercent(value?: number): string {
    return (value ?? 0).toFixed(1);
  }

  formatNumber(value?: number): string {
    return (value ?? 0).toFixed(0);
  }

  formatCost(value?: number): string {
    return (value ?? 0).toFixed(4);
  }
}
