import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeBottomNavComponent } from './employee-bottom-nav.component';

@NgModule({
  declarations: [
    EmployeeBottomNavComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    EmployeeBottomNavComponent,
  ],
})
export class EmployeeBottomNavModule {}