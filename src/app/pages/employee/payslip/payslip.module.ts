import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayslipPageRoutingModule } from './payslip-routing.module';
import { PayslipPage } from './payslip.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeBottomNavModule,
    PayslipPageRoutingModule,
  ],
  declarations: [PayslipPage],
})
export class PayslipPageModule {}