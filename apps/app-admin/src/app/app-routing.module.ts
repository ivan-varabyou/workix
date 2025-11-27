import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'users',
    loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'roles',
    loadChildren: () => import('./modules/roles/roles.module').then((m) => m.RolesModule),
  },
  {
    path: 'analytics',
    loadChildren: () =>
      import('./modules/analytics/analytics.module').then((m) => m.AnalyticsModule),
  },
  {
    path: 'audit-logs',
    loadChildren: () =>
      import('./modules/audit-logs/audit-logs.module').then((m) => m.AuditLogsModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then((m) => m.SettingsModule),
  },
  {
    path: 'pipelines',
    loadChildren: () =>
      import('./modules/pipelines/pipelines.module').then((m) => m.PipelinesModule),
  },
  {
    path: 'integrations',
    loadChildren: () =>
      import('./modules/integrations/integrations.module').then((m) => m.IntegrationsModule),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
