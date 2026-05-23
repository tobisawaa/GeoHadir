import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: 'attendance' | 'leave' | 'overtime' | 'payroll';
}

interface ActivityItem {
  title: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  employeeName = 'Ridho Pratama';
  position = 'Staff Developer';
  today = new Date();
  currentTime = '';
  nextPayrollDate = '25 Juni 2026';

  private clockInterval?: ReturnType<typeof setInterval>;

  menuItems: MenuItem[] = [
    { label: 'Absensi', route: '/app/employee/attendance', icon: 'attendance' },
    { label: 'Cuti', route: '/app/employee/leave', icon: 'leave' },
    { label: 'Lembur', route: '/app/employee/overtime', icon: 'overtime' },
    { label: 'Slip Gaji', route: '/app/employee/payslip', icon: 'payroll' },
  ];

  activities: ActivityItem[] = [
    { title: 'Sakit', date: '10 Mei 2026 - 11 Mei 2026', status: 'Disetujui' },
    { title: 'Cuti Tahunan', date: '15 Jun 2026 - 17 Jun 2026', status: 'Menunggu' },
    { title: 'Lembur', date: '18 Mei 2026 · 18:00 - 20:30', status: 'Disetujui' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateClock();

    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: string): string {
    if (status === 'Disetujui') return 'approved';
    if (status === 'Ditolak') return 'rejected';
    return '';
  }

  private updateClock(): void {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');

    this.today = now;
    this.currentTime = `${hour}.${minute}`;
  }
}