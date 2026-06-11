import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayrollHistoryPageRoutingModule } from './payroll-history-routing.module';
import { PayrollHistoryPage } from './payroll-history.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeBottomNavModule,
    PayrollHistoryPageRoutingModule,
  ],
  declarations: [PayrollHistoryPage],
})
export class PayrollHistoryPageModule {}