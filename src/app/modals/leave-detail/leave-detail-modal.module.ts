import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LeaveDetailModalComponent } from './leave-detail-modal.component';
import { StatusBadgeModule } from '../../components/status-badge/status-badge.module';

@NgModule({
  declarations: [LeaveDetailModalComponent],
  imports: [CommonModule, IonicModule, StatusBadgeModule],
  exports: [LeaveDetailModalComponent],
})
export class LeaveDetailModalModule {}
