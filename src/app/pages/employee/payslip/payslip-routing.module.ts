import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayslipPage } from './payslip.page';

const routes: Routes = [
  {
    path: '',
    component: PayslipPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayslipPageRoutingModule {}
