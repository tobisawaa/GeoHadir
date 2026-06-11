import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

type EmployeeNavKey =
  | 'dashboard'
  | 'attendance'
  | 'requests'
  | 'payroll'
  | 'profile';

interface EmployeeNavItem {
  key: EmployeeNavKey;
  label: string;
  route: string;
  icon: 'grid' | 'attendance' | 'request' | 'payroll' | 'profile';
}

@Component({
  selector: 'app-employee-bottom-nav',
  templateUrl: './employee-bottom-nav.component.html',
  styleUrls: ['./employee-bottom-nav.component.scss'],
  standalone: false,
})
export class EmployeeBottomNavComponent {
  @Input() active: EmployeeNavKey = 'dashboard';

  navItems: EmployeeNavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      route: '/app/employee/dashboard',
      icon: 'grid',
    },
    {
      key: 'attendance',
      label: 'Attendance',
      route: '/app/employee/attendance',
      icon: 'attendance',
    },
    {
      key: 'requests',
      label: 'Request',
      route: '/app/employee/requests',
      icon: 'request',
    },
    {
      key: 'payroll',
      label: 'Payroll',
      route: '/app/employee/payslip',
      icon: 'payroll',
    },
    {
      key: 'profile',
      label: 'Profile',
      route: '/app/employee/profile',
      icon: 'profile',
    },
  ];

  constructor(private router: Router) {}

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}