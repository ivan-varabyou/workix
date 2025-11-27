import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import {
  DashboardActivity,
  DashboardConfig,
  DashboardStat,
  WorkixButtonComponent,
  WorkixDashboardComponent,
} from '@workix/shared/frontend/ui';

import {
  ApiUsageStats,
  AuthenticationStats,
  DashboardStats,
  ErrorRate,
  PipelineExecutionStats,
  SystemHealth,
  TopUser,
  UsersGrowth,
} from '../../interfaces/analytics.interface';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, WorkixDashboardComponent, WorkixButtonComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit {
  // Signals
  stats = signal<DashboardStats | null>(null);
  usersGrowth = signal<UsersGrowth[]>([]);
  authStats = signal<AuthenticationStats | null>(null);
  pipelineStats = signal<PipelineExecutionStats | null>(null);
  apiUsageStats = signal<ApiUsageStats | null>(null);
  systemHealth = signal<SystemHealth | null>(null);
  topUsers = signal<TopUser[]>([]);
  errorRates = signal<ErrorRate | null>(null);
  isLoading = signal<boolean>(true);
  selectedPeriod = signal<string>('7d');
  periods: string[] = ['1d', '7d', '30d', '90d'];

  // Computed: Build dashboard config
  dashboardConfig = computed<DashboardConfig>(() => {
    const statsData = this.stats();
    if (!statsData) {
      return {
        title: 'Analytics Dashboard',
        stats: [],
      };
    }

    const stats: DashboardStat[] = [
      {
        title: 'Total Users',
        value: statsData.totalUsers || 0,
        icon: 'people',
        color: 'primary',
      },
      {
        title: 'Active Users',
        value: statsData.activeUsers || 0,
        icon: 'person',
        color: 'success',
      },
      {
        title: 'Total Pipelines',
        value: statsData.totalPipelines || 0,
        icon: 'workflow',
        color: 'info',
      },
      {
        title: 'API Calls',
        value: statsData.apiCalls || 0,
        icon: 'api',
        color: 'warning',
      },
    ];

    const activities: DashboardActivity[] = (this.topUsers() || [])
      .slice(0, 10)
      .map((user: TopUser) => ({
        id: user.id,
        title: user.name || user.email,
        description: `Last active: ${user.lastActivity || 'N/A'}`,
        timestamp: user.lastActivity ? new Date(user.lastActivity) : new Date(),
        icon: 'person',
        type: 'info',
      }));

    return {
      title: 'Analytics Dashboard',
      stats,
      activities,
      showActivities: true,
      activitiesTitle: 'Top Users',
    };
  });

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  loadAllAnalytics(): void {
    this.isLoading.set(true);

    Promise.all([
      this.analyticsService.getDashboardStats().toPromise(),
      this.analyticsService.getUsersGrowth(this.selectedPeriod()).toPromise(),
      this.analyticsService.getAuthenticationStats(this.selectedPeriod()).toPromise(),
      this.analyticsService.getPipelineExecutionStats(this.selectedPeriod()).toPromise(),
      this.analyticsService.getApiUsageStats(this.selectedPeriod()).toPromise(),
      this.analyticsService.getSystemHealth().toPromise(),
      this.analyticsService.getTopUsers(10).toPromise(),
      this.analyticsService.getErrorRates(this.selectedPeriod()).toPromise(),
    ])
      .then(([stats, users, auth, pipeline, apiUsage, health, topUsers, errors]) => {
        this.stats.set(stats ?? null);
        this.usersGrowth.set(users || []);
        this.authStats.set(auth ?? null);
        this.pipelineStats.set(pipeline ?? null);
        this.apiUsageStats.set(apiUsage ?? null);
        this.systemHealth.set(health ?? null);
        this.topUsers.set(topUsers || []);
        this.errorRates.set(errors ?? null);
        this.isLoading.set(false);
      })
      .catch((error) => {
        console.error('Error loading analytics:', error);
        this.isLoading.set(false);
      });
  }

  changePeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.loadAllAnalytics();
  }
}
