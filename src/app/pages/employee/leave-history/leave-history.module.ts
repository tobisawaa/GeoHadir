import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaveHistoryPageRoutingModule } from './leave-history-routing.module';
import { LeaveHistoryPage } from './leave-history.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeBottomNavModule,
    LeaveHistoryPageRoutingModule,
  ],
  declarations: [LeaveHistoryPage],
})
export class LeaveHistoryPageModule {}