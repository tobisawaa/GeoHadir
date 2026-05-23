import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OvertimeManagementPage } from './overtime-management.page';

const routes: Routes = [{ path: '', component: OvertimeManagementPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OvertimeManagementPageRoutingModule {}
