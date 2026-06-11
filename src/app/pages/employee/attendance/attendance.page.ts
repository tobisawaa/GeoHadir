import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { LocationService, GeoPosition } from '../../../services/location.service';
import { ApiService } from '../../../services/api.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

interface TodayAttendance {
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
}

interface AttendanceLog {
  id?: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: false,
})
export class AttendancePage implements OnInit {
  currentTime = '';
  currentDate = new Date();
  currentLocation: GeoPosition | null = null;

  isLoading = false;
  isCheckingIn = false;
  isCheckingOut = false;
  isDetectingLocation = false;

  todayAttendance: TodayAttendance = {
    date: '-',
    status: 'Belum Check-In',
    checkIn: '-',
    checkOut: '-',
    checkInLatitude: null,
    checkInLongitude: null,
    checkOutLatitude: null,
    checkOutLongitude: null,
  };

  attendanceHistory: AttendanceLog[] = [];

  private clockTimer?: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private api: ApiService,
    private offlineSync: OfflineSyncService,
    private locationService: LocationService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    this.startClock();
    void this.offlineSync.syncWhenOnline();
    this.loadTodayAttendance();
    this.loadAttendanceHistory();
  }

  ionViewWillLeave(): void {
    this.stopClock();
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  async detectLocation(): Promise<void> {
    this.isDetectingLocation = true;

    try {
      this.currentLocation = await this.locationService.getCurrentPositionPromise();
      await this.showToast('Lokasi berhasil terdeteksi.', 'success');
    } catch (error: any) {
      await this.showToast(error?.message || 'Gagal mengambil lokasi.', 'warning');
    } finally {
      this.isDetectingLocation = false;
    }
  }

  async checkIn(): Promise<void> {
    if (this.isCheckingIn) {
      return;
    }

    this.isCheckingIn = true;

    const loading = await this.loadingCtrl.create({
      message: 'Mengambil lokasi check-in...',
      spinner: 'circular',
    });

    await loading.present();

    try {
      const location = await this.locationService.getCurrentPositionPromise();
      this.currentLocation = location;

      const payload = {
        lat: location.lat,
        lng: location.lng,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
      };

      this.api.post<any>('attendance/check-in', payload).subscribe({
        next: async (response) => {
          await loading.dismiss();

          const data = this.extractData(response);

          this.todayAttendance = {
            ...this.todayAttendance,
            date: this.formatDate(new Date().toISOString()),
            status: 'Check-In',
            checkIn: this.formatTime(data?.check_in ?? data?.checkIn ?? new Date().toISOString()),
            checkInLatitude: location.lat,
            checkInLongitude: location.lng,
          };

          await this.showToast('Check-in berhasil dengan lokasi.', 'success');
          this.loadTodayAttendance();
          this.loadAttendanceHistory();
          this.isCheckingIn = false;
        },
        error: async (error) => {
          await loading.dismiss();

          const message =
            error?.error?.message ||
            error?.message ||
            'Gagal check-in. Pastikan backend API sudah berjalan.';

          await this.showToast(message, 'danger');
          this.isCheckingIn = false;
        },
      });
    } catch (error: any) {
      await loading.dismiss();
      await this.showToast(error?.message || 'Gagal mengambil lokasi.', 'warning');
      this.isCheckingIn = false;
    }
  }

  async checkOut(): Promise<void> {
    if (this.isCheckingOut) {
      return;
    }

    this.isCheckingOut = true;

    const loading = await this.loadingCtrl.create({
      message: 'Mengambil lokasi check-out...',
      spinner: 'circular',
    });

    await loading.present();

    try {
      const location = await this.locationService.getCurrentPositionPromise();
      this.currentLocation = location;

      const payload = {
        lat: location.lat,
        lng: location.lng,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
      };

      this.api.post<any>('attendance/check-out', payload).subscribe({
        next: async (response) => {
          await loading.dismiss();

          const data = this.extractData(response);

          this.todayAttendance = {
            ...this.todayAttendance,
            status: 'Selesai',
            checkOut: this.formatTime(data?.check_out ?? data?.checkOut ?? new Date().toISOString()),
            checkOutLatitude: location.lat,
            checkOutLongitude: location.lng,
          };

          await this.showToast('Check-out berhasil dengan lokasi.', 'success');
          this.loadTodayAttendance();
          this.loadAttendanceHistory();
          this.isCheckingOut = false;
        },
        error: async (error) => {
          await loading.dismiss();

          const message =
            error?.error?.message ||
            error?.message ||
            'Gagal check-out. Pastikan backend API sudah berjalan.';

          await this.showToast(message, 'danger');
          this.isCheckingOut = false;
        },
      });
    } catch (error: any) {
      await loading.dismiss();
      await this.showToast(error?.message || 'Gagal mengambil lokasi.', 'warning');
      this.isCheckingOut = false;
    }
  }

  loadTodayAttendance(): void {
    this.isLoading = true;

    this.api.get<any>('attendance/today').subscribe({
      next: (response) => {
        const data = this.extractData(response);

        if (data) {
          this.todayAttendance = this.mapTodayAttendance(data);
        }

        this.isLoading = false;
      },
      error: () => {
        this.todayAttendance = {
          date: this.formatDate(new Date().toISOString()),
          status: 'Belum Check-In',
          checkIn: '-',
          checkOut: '-',
          checkInLatitude: null,
          checkInLongitude: null,
          checkOutLatitude: null,
          checkOutLongitude: null,
        };

        this.isLoading = false;
      },
    });
  }

  loadAttendanceHistory(): void {
    this.api.get<any>('attendance/history').subscribe({
      next: (response) => {
        const data = this.extractData(response);
        const list = Array.isArray(data) ? data : data?.items ?? data?.attendance ?? [];

        this.attendanceHistory = list.map((item: any) => this.mapAttendanceLog(item));
      },
      error: () => {
        this.attendanceHistory = this.getFallbackHistory();
      },
    });
  }

  trackByAttendanceLog(index: number, item: AttendanceLog): number | string {
    return item.id ?? `${item.date}-${item.checkIn}-${index}`;
  }

  private mapTodayAttendance(data: any): TodayAttendance {
    return {
      date: this.formatDate(data?.date ?? data?.attendance_date ?? new Date().toISOString()),
      status: this.normalizeStatus(data?.status ?? data?.attendance_status),
      checkIn: this.formatTime(data?.check_in ?? data?.checkIn),
      checkOut: this.formatTime(data?.check_out ?? data?.checkOut),
      checkInLatitude: this.toNumberOrNull(data?.check_in_latitude ?? data?.checkInLatitude),
      checkInLongitude: this.toNumberOrNull(data?.check_in_longitude ?? data?.checkInLongitude),
      checkOutLatitude: this.toNumberOrNull(data?.check_out_latitude ?? data?.checkOutLatitude),
      checkOutLongitude: this.toNumberOrNull(data?.check_out_longitude ?? data?.checkOutLongitude),
    };
  }

  private mapAttendanceLog(item: any): AttendanceLog {
    return {
      id: item?.id,
      date: this.formatDate(item?.date ?? item?.attendance_date ?? item?.created_at),
      checkIn: this.formatTime(item?.check_in ?? item?.checkIn),
      checkOut: this.formatTime(item?.check_out ?? item?.checkOut),
      status: this.normalizeStatus(item?.status ?? item?.attendance_status),
      latitude: this.toNumberOrNull(item?.check_in_latitude ?? item?.latitude),
      longitude: this.toNumberOrNull(item?.check_in_longitude ?? item?.longitude),
    };
  }

  private normalizeStatus(status: string): string {
    const value = String(status || '').toLowerCase();

    if (value.includes('selesai') || value.includes('completed')) {
      return 'Selesai';
    }

    if (value.includes('check') || value.includes('hadir') || value.includes('present')) {
      return 'Check-In';
    }

    if (value.includes('late') || value.includes('terlambat')) {
      return 'Terlambat';
    }

    return 'Belum Check-In';
  }

  private extractData(response: any): any {
    if (response?.data !== undefined) {
      return response.data;
    }

    return response;
  }

  private updateClock(): void {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    this.currentDate = now;
    this.currentTime = `${hour}.${minute}`;
  }

  private startClock(): void {
    this.updateClock();

    if (this.clockTimer) {
      return;
    }

    this.clockTimer = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  private stopClock(): void {
    if (!this.clockTimer) {
      return;
    }

    clearInterval(this.clockTimer);
    this.clockTimer = undefined;
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  private formatTime(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private getFallbackHistory(): AttendanceLog[] {
    return [
      {
        id: 1,
        date: 'Senin, 08 Juni 2026',
        checkIn: '08.05',
        checkOut: '17.02',
        status: 'Selesai',
        latitude: -6.2,
        longitude: 106.816666,
      },
      {
        id: 2,
        date: 'Jumat, 05 Juni 2026',
        checkIn: '08.18',
        checkOut: '17.00',
        status: 'Terlambat',
        latitude: -6.2,
        longitude: 106.816666,
      },
    ];
  }

  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'top',
    });

    await toast.present();
  }
}
