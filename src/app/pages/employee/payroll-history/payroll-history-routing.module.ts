import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayrollHistoryPage } from './payroll-history.page';
const routes: Routes = [
  {
    path: '',
    component: PayrollHistoryPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollHistoryPageRoutingModule {}
