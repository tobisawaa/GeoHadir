import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoryHubPageRoutingModule } from './history-hub-routing.module';
import { HistoryHubPage } from './history-hub.page';
import { EmployeeBottomNavModule } from '../../../components/employee-bottom-nav/employee-bottom-nav.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeeBottomNavModule,
    HistoryHubPageRoutingModule,
  ],
  declarations: [HistoryHubPage],
})
export class HistoryHubPageModule {}