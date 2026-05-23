import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OvertimePageRoutingModule } from './overtime-routing.module';
import { OvertimePage } from './overtime.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OvertimePageRoutingModule,
  ],
  declarations: [OvertimePage],
})
export class OvertimePageModule {}
