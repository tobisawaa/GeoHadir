import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AttendanceMonitorPageRoutingModule } from './attendance-monitor-routing.module';
import { AttendanceMonitorPage } from './attendance-monitor.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AttendanceMonitorPageRoutingModule],
  declarations: [AttendanceMonitorPage],
})
export class AttendanceMonitorPageModule {}
