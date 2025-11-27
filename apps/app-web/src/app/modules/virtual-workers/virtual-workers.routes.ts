import { Routes } from '@angular/router';

export const VIRTUAL_WORKERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/virtual-workers-list/virtual-workers-list.component').then(
        (m) => m.VirtualWorkersListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/virtual-worker-create/virtual-worker-create.component').then(
        (m) => m.VirtualWorkerCreateComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/virtual-worker-detail/virtual-worker-detail.component').then(
        (m) => m.VirtualWorkerDetailComponent
      ),
  },
];
