import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import {
  MonitorConfig,
  MonitorExecution,
  MonitorStat,
  MonitorTab,
  WorkixMonitorComponent,
} from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-pipeline-monitor',
  standalone: true,
  imports: [CommonModule, WorkixMonitorComponent],
  templateUrl: './pipeline-monitor.component.html',
  styleUrls: ['./pipeline-monitor.component.scss'],
})
export class PipelineMonitorComponent implements OnInit {
  // Signals
  currentExecution = signal<MonitorExecution | null>(null);
  executions = signal<MonitorExecution[]>([
    {
      id: '1',
      status: 'success',
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 7100000),
      duration: 100,
      progress: 100,
      stepsCompleted: 5,
      totalSteps: 5,
    },
    {
      id: '2',
      status: 'failed',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3500000),
      duration: 100,
      progress: 60,
      stepsCompleted: 3,
      totalSteps: 5,
    },
  ]);

  // Computed: Build monitor config
  monitorConfig = computed<MonitorConfig>(() => {
    const stats: MonitorStat[] = [
      {
        label: 'Average Duration',
        value: this.avgDuration(),
        icon: 'schedule',
        color: 'info',
      },
      {
        label: 'Success Rate',
        value: `${this.successRate()}%`,
        icon: 'check_circle',
        color: 'success',
      },
      {
        label: 'Total Executions',
        value: this.totalExecutions(),
        icon: 'list',
        color: 'primary',
      },
      {
        label: 'Last Execution',
        value: this.lastExecution() ? new Date(this.lastExecution()!).toLocaleString() : 'N/A',
        icon: 'history',
        color: 'info',
      },
    ];

    const tabs: MonitorTab[] = [
      { label: 'Execution History', content: 'history' },
      { label: 'Performance', content: 'performance' },
    ];

    const actions = [
      {
        label: 'Execute Now',
        icon: 'play_arrow',
        variant: 'primary' as const,
        onClick: () => this.executeNow(),
      },
    ];

    return {
      title: 'Pipeline Execution Monitor',
      showCurrentExecution: true,
      showTabs: true,
      tabs,
      showStats: true,
      stats,
      actions,
    };
  });

  // Computed
  executionProgress = computed(() => this.currentExecution()?.progress || 0);

  executionDuration = computed(() => {
    const exec = this.currentExecution();
    if (!exec) return '0s';

    if (exec.duration) {
      return `${exec.duration}s`;
    }

    const startTime =
      typeof exec.startTime === 'string' ? new Date(exec.startTime) : exec.startTime;
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return `${elapsed}s`;
  });

  totalExecutions = computed(() => this.executions().length);

  successRate = computed(() => {
    const execs = this.executions();
    if (execs.length === 0) return 0;

    const successful = execs.filter((e) => e.status === 'success').length;
    return Math.round((successful / execs.length) * 100);
  });

  avgDuration = computed(() => {
    const execs = this.executions().filter((e) => e.duration);
    if (execs.length === 0) return '0s';

    const avg = Math.round(execs.reduce((sum, e) => sum + (e.duration || 0), 0) / execs.length);
    return `${avg}s`;
  });

  lastExecution = computed(() => {
    const execs = this.executions();
    const firstExec = execs[0];
    return firstExec && firstExec.startTime ? firstExec.startTime : null;
  });

  ngOnInit(): void {
    this.loadPipelineData();
    this.startMonitoring();
  }

  loadPipelineData(): void {
    // Would load from route params
    // const pipelineId = this.route.snapshot.paramMap.get('id');
  }

  startMonitoring(): void {
    // In real app, would subscribe to WebSocket or polling service
    // for real-time updates
  }

  onActionClick(event: { action: string; data?: Record<string, unknown> }): void {
    if (event.action === 'Execute Now') {
      this.executeNow();
    }
  }

  onExecutionClick(execution: MonitorExecution): void {
    // Would show detailed view
    console.log('View execution:', execution);
  }

  onTabChange(_index: number): void {
    // Handle tab change if needed
  }

  executeNow(): void {
    const newExecution: MonitorExecution = {
      id: Date.now().toString(),
      status: 'running',
      startTime: new Date(),
      progress: 0,
      stepsCompleted: 0,
      totalSteps: 5,
    };

    this.currentExecution.set(newExecution);

    // Simulate execution progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);

        const exec = this.currentExecution();
        if (exec) {
          this.currentExecution.set({
            ...exec,
            status: 'success',
            endTime: new Date(),
            duration: Math.floor(
              (Date.now() -
                (typeof exec.startTime === 'string'
                  ? new Date(exec.startTime).getTime()
                  : exec.startTime.getTime())) /
                1000
            ),
            progress: 100,
            stepsCompleted: 5,
          });

          // Add to history
          this.executions.update((e) => [exec, ...e]);
        }
      } else {
        const exec = this.currentExecution();
        if (exec) {
          this.currentExecution.set({
            ...exec,
            progress: Math.min(progress, 100),
          });
        }
      }
    }, 500);
  }
}
