import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './interfaces/models';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;
  appPages: MenuItem[] = [];
  userInitials = '';
  roleLabel = '';

  constructor(
    private auth: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe((user) => {
      this.user = user;
      this.isLoggedIn = !!user;
      if (user) {
        this.userInitials = this.getInitials(user.name);
        this.roleLabel = this.getRoleLabel(user.role);
      }
      this.buildMenu();
    });
  }

  private getInitials(name: string | undefined): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  private getRoleLabel(role: string | undefined): string {
    const labels: Record<string, string> = {
      employee: 'Karyawan',
      manager: 'Manager',
      admin: 'Administrator',
    };
    return labels[role || ''] || role || 'User';
  }

  private buildMenu() {
    const role = this.auth.getRole();
    
    if (role === 'admin') {
      this.appPages = [
        { title: 'Dashboard', url: '/app/admin/dashboard', icon: 'grid-outline' },
        { title: 'Karyawan', url: '/app/admin/employees', icon: 'people-outline' },
        { title: 'Monitoring Absensi', url: '/app/admin/attendance-monitor', icon: 'camera-outline' },
        { title: 'Manajemen Cuti', url: '/app/admin/leave-management', icon: 'calendar-outline' },
        { title: 'Manajemen Lembur', url: '/app/admin/overtime-management', icon: 'moon-outline' },
        { title: 'Payroll', url: '/app/admin/payroll-management', icon: 'wallet-outline' },
        { title: 'Laporan', url: '/app/admin/reports', icon: 'bar-chart-outline' },
        { title: 'Profil', url: '/app/admin/profile', icon: 'person-outline' },
      ];
    } else if (role === 'employee') {
      this.appPages = [
        { title: 'Dashboard', url: '/app/employee/dashboard', icon: 'grid-outline' },
        { title: 'Absensi', url: '/app/employee/attendance', icon: 'camera-outline' },
        { title: 'Riwayat Absensi', url: '/app/employee/attendance-history', icon: 'time-outline' },
        { title: 'Pengajuan Cuti', url: '/app/employee/leave', icon: 'calendar-outline' },
        { title: 'Riwayat Cuti', url: '/app/employee/leave-history', icon: 'document-text-outline' },
        { title: 'Pengajuan Lembur', url: '/app/employee/overtime', icon: 'moon-outline' },
        { title: 'Riwayat Lembur', url: '/app/employee/overtime-history', icon: 'time-outline' },
        { title: 'Slip Gaji', url: '/app/employee/payslip', icon: 'wallet-outline' },
        { title: 'Riwayat Payroll', url: '/app/employee/payroll-history', icon: 'receipt-outline' },
        { title: 'Profil', url: '/app/employee/profile', icon: 'person-outline' },
      ];
    } else if (role === 'manager') {
      this.appPages = [
        { title: 'Dashboard', url: '/app/manager/dashboard', icon: 'grid-outline' },
        { title: 'Tim Saya', url: '/app/manager/team', icon: 'people-outline' },
        { title: 'Absensi Tim', url: '/app/manager/team-attendance', icon: 'camera-outline' },
        { title: 'Cuti Bawahan', url: '/app/manager/team-leave', icon: 'calendar-outline' },
        { title: 'Lembur Bawahan', url: '/app/manager/team-overtime', icon: 'moon-outline' },
        { title: 'Profil', url: '/app/manager/profile', icon: 'person-outline' },
      ];
    }
  }

  isActive(url: string): boolean {
    return this.router.url === url || this.router.url.startsWith(url + '/');
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  async logout() {
    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
