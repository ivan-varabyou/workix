import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuditLogsRoutingModule } from './audit-logs-routing.module';
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
// Note: AuditLogsComponent is now standalone and uses WorkixDataTableComponent
// AuditLogDetailComponent will be created later or replaced with WorkixDetailViewComponent

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuditLogsRoutingModule,
    FormsModule,
    AuditLogsComponent, // Standalone component
  ],
})
export class AuditLogsModule {}
