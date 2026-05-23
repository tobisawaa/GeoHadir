import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeaveManagementPageRoutingModule } from './leave-management-routing.module';
import { LeaveManagementPage } from './leave-management.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LeaveManagementPageRoutingModule],
  declarations: [LeaveManagementPage],
})
export class LeaveManagementPageModule {}
