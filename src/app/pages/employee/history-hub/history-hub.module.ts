import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoryHubPageRoutingModule } from './history-hub-routing.module';
import { HistoryHubPage } from './history-hub.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryHubPageRoutingModule,
  ],
  declarations: [HistoryHubPage],
})
export class HistoryHubPageModule {}
