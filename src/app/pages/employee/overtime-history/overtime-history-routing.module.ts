import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OvertimeHistoryPage } from './overtime-history.page';
const routes: Routes = [
  {
    path: '',
    component: OvertimeHistoryPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OvertimeHistoryPageRoutingModule {}
