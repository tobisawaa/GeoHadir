import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryHubPage } from './history-hub.page';
const routes: Routes = [
  {
    path: '',
    component: HistoryHubPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoryHubPageRoutingModule {}
