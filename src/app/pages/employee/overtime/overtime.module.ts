import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OvertimePageRoutingModule } from './overtime-routing.module';
import { OvertimePage } from './overtime.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeBottomNavModule,
    OvertimePageRoutingModule,
  ],
  declarations: [OvertimePage],
})
export class OvertimePageModule {}