import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../analytics/analytics.module').then((m) => m.AnalyticsModule),
  },
];

// Note: All components now use Workix UI components from shared/frontend/ui

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class DashboardModule {}
