import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamOvertimePage } from './team-overtime.page';

const routes: Routes = [{ path: '', component: TeamOvertimePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamOvertimePageRoutingModule {}
