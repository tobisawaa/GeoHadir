import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaveHistoryPageRoutingModule } from './leave-history-routing.module';
import { LeaveHistoryPage } from './leave-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaveHistoryPageRoutingModule,
  ],
  declarations: [LeaveHistoryPage],
})
export class LeaveHistoryPageModule {}
