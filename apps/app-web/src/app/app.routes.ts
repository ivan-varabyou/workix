import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'pipelines',
    loadChildren: () =>
      import('./modules/pipelines/pipelines.routes').then((m) => m.PIPELINES_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () => import('./modules/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'virtual-workers',
    loadChildren: () =>
      import('./modules/virtual-workers/virtual-workers.routes').then(
        (m) => m.VIRTUAL_WORKERS_ROUTES
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
