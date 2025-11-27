import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './pages/analytics/analytics.component';

// Note: AnalyticsComponent is now standalone and uses WorkixDashboardComponent
// ChartComponent and StatsComponent will be created later or replaced with Workix UI components

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    AnalyticsComponent, // Standalone component
  ],
})
export class AnalyticsModule {}
