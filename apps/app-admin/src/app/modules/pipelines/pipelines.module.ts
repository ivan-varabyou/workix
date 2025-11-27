import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PipelineBuilderComponent } from './pages/pipeline-builder/pipeline-builder.component';
import { PipelineDetailComponent } from './pages/pipeline-detail/pipeline-detail.component';
import { PipelineListComponent } from './pages/pipeline-list/pipeline-list.component';
// Components
import { PipelinesComponent } from './pages/pipelines/pipelines.component';
// Routing
import { PipelinesRoutingModule } from './pipelines-routing.module';

// Note: PipelineListComponent, PipelineDetailComponent, and PipelineBuilderComponent are now standalone and use Workix UI components
// StepEditorComponent and CanvasComponent have been replaced by WorkixStepEditorComponent and WorkixCanvasComponent from shared/ui

@NgModule({
  declarations: [PipelinesComponent],
  imports: [
    CommonModule,
    PipelinesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    PipelineListComponent, // Standalone component
    PipelineDetailComponent, // Standalone component
    PipelineBuilderComponent, // Standalone component (migrated to Workix UI)
  ],
})
export class PipelinesModule {}
