import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleDetailComponent } from './pages/role-detail/role-detail.component';
import { RolesComponent } from './pages/roles/roles.component';

const routes: Routes = [
  {
    path: '',
    component: RolesComponent,
  },
  {
    path: ':id',
    component: RoleDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule {}
