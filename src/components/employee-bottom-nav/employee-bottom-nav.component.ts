import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

type EmployeeNavKey = 'dashboard' | 'attendance' | 'requests' | 'payroll' | 'profile';

@Component({
  selector: 'app-employee-bottom-nav',
  templateUrl: './employee-bottom-nav.component.html',
  styleUrls: ['./employee-bottom-nav.component.scss'],
})
export class EmployeeBottomNavComponent {
  @Input() active: EmployeeNavKey = 'dashboard';

  constructor(private router: Router) {}

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}
