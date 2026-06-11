import { ManagerBottomNavModule } from '../../../components/manager-bottom-nav/manager-bottom-nav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamOvertimePageRoutingModule } from './team-overtime-routing.module';
import { TeamOvertimePage } from './team-overtime.page';

@NgModule({
  imports: [
    ManagerBottomNavModule,CommonModule, FormsModule, IonicModule, TeamOvertimePageRoutingModule],
  declarations: [TeamOvertimePage],
})
export class TeamOvertimePageModule {}


