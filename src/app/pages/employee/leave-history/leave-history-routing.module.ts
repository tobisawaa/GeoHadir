import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeaveHistoryPage } from './leave-history.page';
const routes: Routes = [
  {
    path: '',
    component: LeaveHistoryPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveHistoryPageRoutingModule {}
