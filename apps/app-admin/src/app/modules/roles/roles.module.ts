import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PermissionListComponent } from './components/permission-list/permission-list.component';
import { RoleDetailComponent } from './pages/role-detail/role-detail.component';
import { RolesComponent } from './pages/roles/roles.component';
import { RolesRoutingModule } from './roles-routing.module';

// Note: RolesComponent and RoleDetailComponent are now standalone and use Workix UI components
// RoleEditComponent has been replaced by WorkixFormDialogComponent
// PermissionListComponent is now standalone and uses Workix UI components

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RolesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RolesComponent, // Standalone component
    RoleDetailComponent, // Standalone component
    PermissionListComponent, // Standalone component (migrated to Workix UI)
  ],
})
export class RolesModule {}
