import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UsersComponent } from './pages/users/users.component';
import { UsersRoutingModule } from './users-routing.module';
// Note: UsersComponent and UserDetailComponent are now standalone and use Workix UI components
// UserEditComponent and UserDeleteDialogComponent have been replaced by WorkixFormDialogComponent and WorkixConfirmDialogComponent

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UsersRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    UsersComponent, // Standalone component
    UserDetailComponent, // Standalone component
  ],
})
export class UsersModule {}
