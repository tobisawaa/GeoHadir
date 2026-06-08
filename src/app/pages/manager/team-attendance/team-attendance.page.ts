import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AttendanceService } from '../../../services/attendance.service';
import { Attendance } from '../../../interfaces/models';

@Component({
  selector: 'app-team-attendance',
  templateUrl: './team-attendance.page.html',
  styleUrls: ['./team-attendance.page.scss'],
  standalone: false,
})
export class TeamAttendancePage implements OnInit {
  attendances: Attendance[] = [];
  loading = true;
  error = false;
  errorMessage = '';

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

    this.attendanceService.getHistory().subscribe({
      next: (res) => {
        this.attendances = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data absensi';
      },
    });
  }

  async doRefresh(event: any) {
    this.attendanceService.getHistory().subscribe({
      next: (res) => {
        this.attendances = res.data;
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
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
    this.router.navigate(['/app/manager/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
