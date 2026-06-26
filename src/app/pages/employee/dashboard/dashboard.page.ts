import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from '../../../services/attendance.service';
import { LeaveService } from '../../../services/leave.service';
import { OvertimeService } from '../../../services/overtime.service';
import { Attendance, LeaveRequest, OvertimeRequest } from '../../../interfaces/models';

interface MenuItem {
  label: string;
  route: string;
  icon: 'attendance' | 'leave' | 'overtime' | 'payroll';
}

interface ActivityItem {
  title: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
  sortDate: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  employeeName = 'Karyawan';
  position = 'Karyawan';
  greeting = 'Selamat Pagi';
  today = new Date();
  currentTime = '';
  isLoadingActivities = false;

  private clockInterval?: ReturnType<typeof setInterval>;

  menuItems: MenuItem[] = [
    { label: 'Presensi', route: '/app/employee/attendance', icon: 'attendance' },
    { label: 'Cuti', route: '/app/employee/leave', icon: 'leave' },
    { label: 'Lembur', route: '/app/employee/overtime', icon: 'overtime' },
    { label: 'Slip Gaji', route: '/app/employee/payslip', icon: 'payroll' },
  ];

  activities: ActivityItem[] = [];

  constructor(
    private router: Router,
    private offlineSync: OfflineSyncService,
    private auth: AuthService,
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private overtimeService: OvertimeService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopClock();
  }

  ionViewWillEnter(): void {
    this.startClock();
    this.loadCurrentUser();
    this.loadRecentActivities();
    void this.offlineSync.syncWhenOnline();
  }

  ionViewWillLeave(): void {
    this.stopClock();
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: string): string {
    if (status === 'Disetujui') return 'approved';
    if (status === 'Ditolak') return 'rejected';
    return '';
  }

  private loadCurrentUser(): void {
    const user = this.auth.getCurrentUser();

    this.employeeName = user?.name || 'Karyawan';
    this.position = user?.position || this.getRoleLabel(user?.role);
  }

  private getRoleLabel(role?: string): string {
    if (role === 'manager') {
      return 'Manajer';
    }

    return 'Karyawan';
  }

  private loadRecentActivities(): void {
    this.isLoadingActivities = true;

    forkJoin({
      attendance: this.attendanceService.getHistory({ per_page: 5 }).pipe(catchError(() => of(null))),
      leaves: this.leaveService.getMyLeaves({ per_page: 5 }).pipe(catchError(() => of(null))),
      overtimes: this.overtimeService.getMyOvertimes({ per_page: 5 }).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ attendance, leaves, overtimes }) => {
        const items = [
          ...this.mapAttendanceActivities(this.extractArray<Attendance>(attendance)),
          ...this.mapLeaveActivities(this.extractArray<LeaveRequest>(leaves)),
          ...this.mapOvertimeActivities(this.extractArray<OvertimeRequest>(overtimes)),
        ];

        this.activities = items
          .sort((a, b) => b.sortDate - a.sortDate)
          .slice(0, 3);
      },
      complete: () => {
        this.isLoadingActivities = false;
      },
    });
  }

  private mapAttendanceActivities(items: Attendance[]): ActivityItem[] {
    return items.map((item) => ({
      title: 'Presensi',
      date: `${this.formatDate(item.date)} - ${this.formatTime(item.check_in)}${item.check_out ? ` - ${this.formatTime(item.check_out)}` : ''}`,
      status: this.mapAttendanceStatus(item.status),
      sortDate: this.toTimestamp(item.date || item.check_in),
    }));
  }

  private mapLeaveActivities(items: LeaveRequest[]): ActivityItem[] {
    return items.map((item) => ({
      title: this.getLeaveTypeLabel(item.type),
      date: `${this.formatDate(item.start_date)} - ${this.formatDate(item.end_date)}`,
      status: this.mapRequestStatus(item.status),
      sortDate: this.toTimestamp(item.created_at || item.start_date),
    }));
  }

  private mapOvertimeActivities(items: OvertimeRequest[]): ActivityItem[] {
    return items.map((item) => ({
      title: 'Lembur',
      date: `${this.formatDate(item.date)} - ${this.formatTime(item.start_time)} - ${this.formatTime(item.end_time)}`,
      status: this.mapRequestStatus(item.status),
      sortDate: this.toTimestamp(item.created_at || item.date),
    }));
  }

  private extractArray<T>(response: any): T[] {
    const payload = response?.data ?? response;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  private mapAttendanceStatus(status?: string): ActivityItem['status'] {
    if (status === 'absent') {
      return 'Ditolak';
    }

    return 'Disetujui';
  }

  private mapRequestStatus(status?: string): ActivityItem['status'] {
    if (status === 'approved') return 'Disetujui';
    if (status === 'rejected') return 'Ditolak';
    return 'Menunggu';
  }

  private getLeaveTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      annual: 'Cuti Tahunan',
      sick: 'Sakit',
      personal: 'Cuti Pribadi',
      maternity: 'Cuti Melahirkan',
      other: 'Cuti Lainnya',
    };

    return labels[type || ''] || 'Cuti';
  }

  private formatDate(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatTime(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }

    return value.slice(0, 5);
  }

  private toTimestamp(value?: string | null): number {
    if (!value) {
      return 0;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  private updateClock(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const hour = currentHour.toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');

    this.today = now;
    this.greeting = this.getGreeting(currentHour);
    this.currentTime = `${hour}.${minute}`;
  }

  private getGreeting(hour: number): string {
    if (hour >= 4 && hour <= 10) {
      return 'Selamat Pagi';
    }

    if (hour >= 11 && hour <= 15) {
      return 'Selamat Siang';
    }

    if (hour >= 16 && hour <= 18) {
      return 'Selamat Sore';
    }

    return 'Selamat Malam';
  }

  private startClock(): void {
    this.updateClock();

    if (this.clockInterval) {
      return;
    }

    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  private stopClock(): void {
    if (!this.clockInterval) {
      return;
    }

    clearInterval(this.clockInterval);
    this.clockInterval = undefined;
  }
}
