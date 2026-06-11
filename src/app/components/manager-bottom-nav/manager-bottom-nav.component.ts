import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

type ManagerNavKey = 'dashboard' | 'team' | 'attendance' | 'approval' | 'profile';

interface ManagerNavItem {
  key: ManagerNavKey;
  label: string;
  route: string;
  icon: 'overview' | 'team' | 'attendance' | 'approval' | 'profile';
}

@Component({
  selector: 'app-manager-bottom-nav',
  templateUrl: './manager-bottom-nav.component.html',
  styleUrls: ['./manager-bottom-nav.component.scss'],
  standalone: false,
})
export class ManagerBottomNavComponent {
  @Input() active: ManagerNavKey = 'dashboard';

  navItems: ManagerNavItem[] = [
    {
      key: 'dashboard',
      label: 'Overview',
      route: '/app/manager/dashboard',
      icon: 'overview',
    },
    {
      key: 'team',
      label: 'Tim',
      route: '/app/manager/team',
      icon: 'team',
    },
    {
      key: 'attendance',
      label: 'Presensi',
      route: '/app/manager/team-attendance',
      icon: 'attendance',
    },
    {
      key: 'approval',
      label: 'Approval',
      route: '/app/manager/team-leave',
      icon: 'approval',
    },
    {
      key: 'profile',
      label: 'Profil',
      route: '/app/manager/profile',
      icon: 'profile',
    },
  ];

  constructor(private router: Router) {}

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}
