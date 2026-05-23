import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StatusBadgeComponent } from './status-badge.component';

@NgModule({
  declarations: [StatusBadgeComponent],
  imports: [CommonModule, IonicModule],
  exports: [StatusBadgeComponent],
})
export class StatusBadgeModule {}
