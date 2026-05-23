import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PayrollManagementPageRoutingModule } from './payroll-management-routing.module';
import { PayrollManagementPage } from './payroll-management.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PayrollManagementPageRoutingModule],
  declarations: [PayrollManagementPage],
})
export class PayrollManagementPageModule {}
