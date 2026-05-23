import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OvertimeManagementPageRoutingModule } from './overtime-management-routing.module';
import { OvertimeManagementPage } from './overtime-management.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, OvertimeManagementPageRoutingModule],
  declarations: [OvertimeManagementPage],
})
export class OvertimeManagementPageModule {}
