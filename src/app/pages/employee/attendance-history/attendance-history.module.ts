import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceHistoryPageRoutingModule } from './attendance-history-routing.module';
import { AttendanceHistoryPage } from './attendance-history.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeBottomNavModule,
    AttendanceHistoryPageRoutingModule,
  ],
  declarations: [AttendanceHistoryPage],
})
export class AttendanceHistoryPageModule {}