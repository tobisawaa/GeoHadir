import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OvertimePage } from './overtime.page';
const routes: Routes = [
  {
    path: '',
    component: OvertimePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OvertimePageRoutingModule {}
