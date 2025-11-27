import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IntegrationAnalyticsComponent } from './pages/integration-analytics/integration-analytics.component';
import { IntegrationsComponent } from './pages/integrations/integrations.component';

const routes: Routes = [
  {
    path: '',
    component: IntegrationsComponent,
  },
  {
    path: 'analytics',
    component: IntegrationAnalyticsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegrationsRoutingModule {}
