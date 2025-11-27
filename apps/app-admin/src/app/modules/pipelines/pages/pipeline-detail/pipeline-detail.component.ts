import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { Execution, Pipeline } from '@workix/shared/frontend/core';
import {
  DetailViewAction,
  DetailViewConfig,
  DetailViewField,
  WorkixButtonComponent,
  WorkixCardComponent,
  WorkixChipComponent,
  WorkixDetailViewComponent,
  WorkixIconComponent,
  WorkixSnackbarService,
  WorkixSpinnerComponent,
} from '@workix/shared/frontend/ui';

import { PipelineService } from '../../services/pipeline.service';

@Component({
  selector: 'app-pipeline-detail',
  standalone: true,
  imports: [
    CommonModule,
    WorkixDetailViewComponent,
    WorkixButtonComponent,
    WorkixCardComponent,
    WorkixChipComponent,
    WorkixIconComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './pipeline-detail.component.html',
  styleUrl: './pipeline-detail.component.scss',
})
export class PipelineDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pipelineService = inject(PipelineService);
  private snackbar = inject(WorkixSnackbarService);

  // Signals
  pipeline = signal<Pipeline | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed: Build detail config
  detailConfig = computed<DetailViewConfig>(() => {
    const pipeline = this.pipeline();
    if (!pipeline) {
      return {
        title: 'Pipeline Details',
        fields: [],
        showBackButton: true,
      };
    }

    const fields: DetailViewField[] = [
      { label: 'Status', value: pipeline.status || 'draft', format: 'text' },
      { label: 'Steps', value: String(pipeline.steps?.length || 0), format: 'text' },
      {
        label: 'Created',
        value: pipeline.createdAt || '',
        format: 'date',
      },
    ];

    const actions: DetailViewAction[] = [
      {
        label: 'Execute',
        icon: 'play_arrow',
        variant: 'primary',
        onClick: () => this.executePipeline(),
      },
      {
        label: 'Edit',
        icon: 'edit',
        variant: 'primary',
        onClick: () => this.editPipeline(),
      },
    ];

    return {
      title: pipeline.name,
      subtitle: pipeline.description,
      fields,
      actions,
      showBackButton: true,
      backRoute: '/pipelines',
    };
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadPipeline(params['id']);
      }
    });
  }

  loadPipeline(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pipelineService.getPipeline(id).subscribe({
      next: (pipeline) => {
        this.pipeline.set(pipeline);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pipeline:', err);
        this.errorMessage.set('Failed to load pipeline');
        this.snackbar.open('Error loading pipeline', undefined, {
          panelClass: 'error',
        });
        this.isLoading.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/pipelines']);
  }

  onActionClick(_event: { action: string; data?: Record<string, unknown> }): void {
    // Actions are handled directly in the config
  }

  executePipeline(): void {
    const pipeline = this.pipeline();
    if (!pipeline) return;

    const pipelineId = pipeline.id;
    if (!pipelineId) return;
    this.pipelineService.executePipeline(pipelineId).subscribe({
      next: (_execution) => {
        this.snackbar.open('Pipeline execution started', undefined, {
          panelClass: 'success',
        });
        // Reload to show new execution
        if (pipelineId) {
          this.loadPipeline(pipelineId);
        }
      },
      error: (err) => {
        console.error('Error executing pipeline:', err);
        this.snackbar.open('Error executing pipeline', undefined, {
          panelClass: 'error',
        });
      },
    });
  }

  editPipeline(): void {
    const pipeline = this.pipeline();
    if (pipeline && pipeline.id) {
      this.router.navigate(['/pipelines/builder', pipeline.id]);
    }
  }

  getExecutionDuration(execution: Execution): string {
    if (!execution.completedAt) return 'Still running...';
    const startTime =
      execution.startedAt instanceof Date
        ? execution.startedAt.getTime()
        : new Date(execution.startedAt || '').getTime();
    const endTime =
      execution.completedAt instanceof Date
        ? execution.completedAt.getTime()
        : new Date(execution.completedAt || '').getTime();
    const duration = endTime - startTime;
    return `${(duration / 1000).toFixed(2)}s`;
  }
}
