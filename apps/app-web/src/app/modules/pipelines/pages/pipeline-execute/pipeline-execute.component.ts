import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkixCardComponent } from '@workix/shared/frontend/ui';

@Component({
  selector: 'app-pipeline-execute',
  standalone: true,
  imports: [CommonModule, WorkixCardComponent],
  templateUrl: './pipeline-execute.component.html',
  styleUrls: ['./pipeline-execute.component.scss'],
})
export class PipelineExecuteComponent {
  pipelineId = signal<string | null>(null);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.pipelineId.set(params['id']);
    });
  }
}
