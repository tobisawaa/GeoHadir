import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamAttendancePageRoutingModule } from './team-attendance-routing.module';
import { TeamAttendancePage } from './team-attendance.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TeamAttendancePageRoutingModule],
  declarations: [TeamAttendancePage],
})
export class TeamAttendancePageModule {}
