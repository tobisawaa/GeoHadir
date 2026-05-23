import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollManagementPage } from './payroll-management.page';

const routes: Routes = [{ path: '', component: PayrollManagementPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollManagementPageRoutingModule {}
