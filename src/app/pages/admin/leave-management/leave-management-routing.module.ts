import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveManagementPage } from './leave-management.page';

const routes: Routes = [{ path: '', component: LeaveManagementPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveManagementPageRoutingModule {}
