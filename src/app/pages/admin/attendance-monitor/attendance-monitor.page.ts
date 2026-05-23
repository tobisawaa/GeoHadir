import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AttendanceService } from '../../../services/attendance.service';
import { Attendance } from '../../../interfaces/models';

interface AttendanceSummary {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  absen: number;
}

interface EmployeeAttendance {
  id: number;
  name: string;
  avatar?: string;
  check_in: string;
  check_out: string;
  status: 'present' | 'late' | 'absent';
}

@Component({
  selector: 'app-attendance-monitor',
  templateUrl: './attendance-monitor.page.html',
  styleUrls: ['./attendance-monitor.page.scss'],
  standalone: false,
})
export class AttendanceMonitorPage implements OnInit {
  selectedDate: string = new Date().toISOString().split('T')[0];
  attendances: EmployeeAttendance[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  summary: AttendanceSummary = { total: 0, hadir: 0, izin: 0, sakit: 0, absen: 0 };

  constructor(
    private attendanceService: AttendanceService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadAttendance();
  }

  loadAttendance() {
    this.loading = true;
    this.error = false;

    this.attendanceService.getHistory({ month: this.selectedDate.substring(0, 7) }).subscribe({
      next: (res) => {
        const data = res.data;
        this.attendances = this.mockEmployeeAttendance();
        this.calculateSummary();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data absensi';
      },
    });
  }

  private mockEmployeeAttendance(): EmployeeAttendance[] {
    return [
      { id: 1, name: 'Budi Santoso', check_in: '07:55', check_out: '17:05', status: 'present' },
      { id: 2, name: 'Siti Rahmawati', check_in: '08:15', check_out: '17:10', status: 'late' },
      { id: 3, name: 'Ahmad Fauzi', check_in: '-', check_out: '-', status: 'absent' },
      { id: 4, name: 'Dewi Lestari', check_in: '07:50', check_out: '16:55', status: 'present' },
      { id: 5, name: 'Rudi Hermawan', check_in: '08:30', check_out: '17:20', status: 'late' },
      { id: 6, name: 'Fitri Handayani', check_in: '08:00', check_out: '17:00', status: 'present' },
      { id: 7, name: 'Agus Wijaya', check_in: '-', check_out: '-', status: 'absent' },
      { id: 8, name: 'Rina Marlina', check_in: '07:45', check_out: '17:15', status: 'present' },
    ];
  }

  private calculateSummary() {
    const hadir = this.attendances.filter((a) => a.status === 'present').length;
    const terlambat = this.attendances.filter((a) => a.status === 'late').length;
    const absen = this.attendances.filter((a) => a.status === 'absent').length;
    this.summary = {
      total: this.attendances.length,
      hadir,
      izin: 2,
      sakit: 1,
      absen: absen + 2,
    };
  }

  onDateChange() {
    this.loadAttendance();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'present': return 'Hadir';
      case 'late': return 'Terlambat';
      case 'absent': return 'Absen';
      default: return status;
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
