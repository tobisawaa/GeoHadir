import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OvertimeDetailModalComponent } from './overtime-detail-modal.component';
import { StatusBadgeModule } from '../../components/status-badge/status-badge.module';

@NgModule({
  declarations: [OvertimeDetailModalComponent],
  imports: [CommonModule, IonicModule, StatusBadgeModule],
  exports: [OvertimeDetailModalComponent],
})
export class OvertimeDetailModalModule {}
