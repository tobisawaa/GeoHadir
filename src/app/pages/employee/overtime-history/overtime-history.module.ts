import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OvertimeHistoryPageRoutingModule } from './overtime-history-routing.module';
import { OvertimeHistoryPage } from './overtime-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OvertimeHistoryPageRoutingModule,
  ],
  declarations: [OvertimeHistoryPage],
})
export class OvertimeHistoryPageModule {}
