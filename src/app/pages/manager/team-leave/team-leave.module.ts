import { ManagerBottomNavModule } from '../../../components/manager-bottom-nav/manager-bottom-nav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamLeavePageRoutingModule } from './team-leave-routing.module';
import { TeamLeavePage } from './team-leave.page';

@NgModule({
  imports: [
    ManagerBottomNavModule,CommonModule, FormsModule, IonicModule, TeamLeavePageRoutingModule],
  declarations: [TeamLeavePage],
})
export class TeamLeavePageModule {}


