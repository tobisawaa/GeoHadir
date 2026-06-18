import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { ApiService } from '../../../services/api.service';

interface TeamAttendance {
  id?: number;
  user_id: number;
  employee_id: number;
  name: string;
  position: string;
  department: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'late' | 'absent' | string;
}

@Component({
  selector: 'app-team-attendance',
  templateUrl: './team-attendance.page.html',
  styleUrls: ['./team-attendance.page.scss'],
  standalone: false,
})
export class TeamAttendancePage implements OnInit {
  attendances: TeamAttendance[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private offlineSync: OfflineSyncService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadAttendance();
  }

  loadAttendance() {
    this.loading = true;
    this.error = false;

    this.api.get<any>('dashboard').subscribe({
      next: (res) => {
        this.attendances = this.extractDashboardAttendance(res).map((item) => this.mapAttendance(item));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data presensi tim';
      },
    });
  }

  async doRefresh(event: any) {
    this.api.get<any>('dashboard').subscribe({
      next: (res) => {
        this.attendances = this.extractDashboardAttendance(res).map((item) => this.mapAttendance(item));
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
      case 'absent': return 'Tidak Hadir';
      default: return status;
    }
  }

  trackByAttendance(index: number, attendance: TeamAttendance): number | string {
    return attendance.id ?? `${attendance.user_id}-${attendance.date}-${index}`;
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

  private extractDashboardAttendance(response: any): TeamAttendance[] {
    const data = response?.data !== undefined ? response.data : response;
    const list = data?.today_attendance ?? data?.items ?? data?.attendances ?? [];

    return Array.isArray(list) ? list : [];
  }

  private mapAttendance(item: any): TeamAttendance {
    return {
      id: item?.id ?? undefined,
      user_id: Number(item?.user_id ?? 0),
      employee_id: Number(item?.employee_id ?? item?.employee?.id ?? 0),
      name: item?.name ?? item?.employee_name ?? item?.employee?.user?.name ?? 'Karyawan',
      position: item?.position ?? item?.employee?.position?.title ?? 'Karyawan',
      department: item?.department ?? item?.employee?.department?.name ?? 'Umum',
      date: item?.date ?? new Date().toISOString(),
      check_in: item?.check_in ?? null,
      check_out: item?.check_out ?? null,
      status: item?.status ?? 'absent',
    };
  }
}
