import { Routes } from '@angular/router';

export const PIPELINES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pipeline-list/pipeline-list.component').then((m) => m.PipelineListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/pipeline-detail/pipeline-detail.component').then(
        (m) => m.PipelineDetailComponent
      ),
  },
  {
    path: ':id/execute',
    loadComponent: () =>
      import('./pages/pipeline-execute/pipeline-execute.component').then(
        (m) => m.PipelineExecuteComponent
      ),
  },
];
