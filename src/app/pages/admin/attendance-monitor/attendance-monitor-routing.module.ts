import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceMonitorPage } from './attendance-monitor.page';

const routes: Routes = [{ path: '', component: AttendanceMonitorPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceMonitorPageRoutingModule {}
