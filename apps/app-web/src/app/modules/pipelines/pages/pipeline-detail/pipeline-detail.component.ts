import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Pipeline } from '@workix/shared/frontend/core';
import { WorkixCardComponent, WorkixDetailViewComponent } from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-pipeline-detail',
  standalone: true,
  imports: [CommonModule, WorkixCardComponent, WorkixDetailViewComponent],
  templateUrl: './pipeline-detail.component.html',
  styleUrls: ['./pipeline-detail.component.scss'],
})
export class PipelineDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  pipelineId = signal<string | null>(null);
  pipeline = signal<Pipeline | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.pipelineId.set(params['id']);
      // TODO: Load pipeline from service
    });
  }
}
