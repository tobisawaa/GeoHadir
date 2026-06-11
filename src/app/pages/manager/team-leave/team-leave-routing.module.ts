import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamLeavePage } from './team-leave.page';

const routes: Routes = [{ path: '', component: TeamLeavePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamLeavePageRoutingModule {}

