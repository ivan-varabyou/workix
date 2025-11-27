import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProviderCredentialsComponent } from './components/provider-credentials/provider-credentials.component';
// Routing
import { IntegrationsRoutingModule } from './integrations-routing.module';
import { IntegrationAnalyticsComponent } from './pages/integration-analytics/integration-analytics.component';
// Components
import { IntegrationsComponent } from './pages/integrations/integrations.component';

// Note: IntegrationsComponent and IntegrationAnalyticsComponent are now standalone and use Workix UI components
// ProviderCredentialsComponent has been migrated to use Workix UI components
// AddCredentialDialogComponent and AddProviderDialogComponent have been replaced by WorkixFormDialogComponent

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    IntegrationsRoutingModule,
    IntegrationsComponent, // Standalone component
    IntegrationAnalyticsComponent, // Standalone component
    ProviderCredentialsComponent, // Standalone component (migrated to Workix UI)
  ],
})
export class IntegrationsModule {}
