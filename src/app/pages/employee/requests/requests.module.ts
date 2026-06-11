import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RequestsPageRoutingModule } from './requests-routing.module';
import { RequestsPage } from './requests.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestsPageRoutingModule,
    EmployeeBottomNavModule,
  ],
  declarations: [RequestsPage],
})
export class RequestsPageModule {}
