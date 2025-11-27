import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  DashboardActivity,
  DashboardConfig,
  DashboardStat,
  WorkixDashboardComponent,
} from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, WorkixDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  userStats = signal({
    pipelines: 12,
    executions: 256,
    success: 248,
    failed: 8,
  });

  recentActivitiesData = signal<DashboardActivity[]>([
    {
      id: '1',
      title: 'Pipeline Created',
      description: 'Data Processing Pipeline',
      timestamp: new Date(),
      type: 'info',
    },
    {
      id: '2',
      title: 'Execution Completed',
      description: 'Email Notification Pipeline',
      timestamp: new Date(Date.now() - 3600000),
      type: 'success',
    },
  ]);

  // Computed: Build dashboard config
  dashboardConfig = computed<DashboardConfig>(() => {
    const stats = this.userStats();
    const dashboardStats: DashboardStat[] = [
      {
        title: 'Active Pipelines',
        value: stats.pipelines.toString(),
        icon: 'pipe',
        color: 'primary',
      },
      {
        title: 'Total Executions',
        value: stats.executions.toString(),
        icon: 'trending_up',
        color: 'info',
      },
      {
        title: 'Successful',
        value: stats.success.toString(),
        icon: 'check_circle',
        color: 'success',
      },
      {
        title: 'Failed',
        value: stats.failed.toString(),
        icon: 'error',
        color: 'danger',
      },
    ];

    return {
      title: 'Dashboard',
      stats: dashboardStats,
      activities: this.recentActivitiesData(),
      showActivities: true,
      activitiesTitle: 'Recent Activity',
    };
  });
}
