import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { UsersComponent } from './pages/users/users.component';

const routes: Routes = [
  { path: '', component: UsersComponent },
  { path: ':id', component: UserDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
