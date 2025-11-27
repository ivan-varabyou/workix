import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PipelineBuilderComponent } from './pages/pipeline-builder/pipeline-builder.component';
import { PipelineDetailComponent } from './pages/pipeline-detail/pipeline-detail.component';
import { PipelinesComponent } from './pages/pipelines/pipelines.component';

const routes: Routes = [
  {
    path: '',
    component: PipelinesComponent,
    children: [
      {
        path: '',
        component: PipelineListComponent,
      },
      {
        path: 'builder',
        component: PipelineBuilderComponent,
      },
      {
        path: 'builder/:id',
        component: PipelineBuilderComponent,
      },
      {
        path: ':id',
        component: PipelineDetailComponent,
      },
    ],
  },
];

import { PipelineListComponent } from './pages/pipeline-list/pipeline-list.component';

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PipelinesRoutingModule {}
