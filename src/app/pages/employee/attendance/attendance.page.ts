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

interface AttendanceArea {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: false,
})
export class AttendancePage implements OnInit {
  private readonly attendanceCooldownSeconds = 30;
  private readonly gpsToleranceMeter = 500;

  readonly attendanceArea: AttendanceArea = {
    name: 'Universitas Buana Perjuangan Karawang',
    address: 'Jl. HS. Ronggo Waluyo, Telukjambe Timur, Karawang',
    latitude: -6.322082,
    longitude: 107.305543,
    radiusMeter: 500,
  };

  currentTime = '';
  currentDate = new Date();
  currentLocation: GeoPosition | null = null;

  isLoading = false;
  isCheckingIn = false;
  isCheckingOut = false;
  isDetectingLocation = false;
  attendanceCooldownRemaining = 0;

  todayAttendance: TodayAttendance = {
    date: '-',
    status: 'Belum Masuk',
    checkIn: '-',
    checkOut: '-',
    checkInLatitude: null,
    checkInLongitude: null,
    checkOutLatitude: null,
    checkOutLongitude: null,
  };

  attendanceHistory: AttendanceLog[] = [];

  private clockTimer?: ReturnType<typeof setInterval>;
  private cooldownTimer?: ReturnType<typeof setInterval>;
  private readonly mapPreviewRangeMeter = 1200;

  constructor(
    private router: Router,
    private api: ApiService,
    private offlineSync: OfflineSyncService,
    private locationService: LocationService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {}

  get distanceFromAreaMeter(): number | null {
    if (!this.currentLocation) {
      return null;
    }

    return this.calculateDistanceMeter(
      this.currentLocation.lat,
      this.currentLocation.lng,
      this.attendanceArea.latitude,
      this.attendanceArea.longitude
    );
  }

  get isInsideAttendanceArea(): boolean {
    const distance = this.distanceFromAreaMeter;
    return distance !== null && distance <= this.effectiveAttendanceRadiusMeter;
  }

  get areaStatusText(): string {
    if (!this.currentLocation) {
      return 'Belum dicek';
    }

    return this.isInsideAttendanceArea ? 'Dalam area presensi' : 'Di luar area presensi';
  }

  get distanceText(): string {
    const distance = this.distanceFromAreaMeter;

    if (distance === null) {
      return '-';
    }

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km dari titik kampus`;
    }

    return `${Math.round(distance)} meter dari titik kampus`;
  }

  get accuracyText(): string {
    if (!this.currentLocation?.accuracy) {
      return '-';
    }

    return `${Math.round(this.currentLocation.accuracy)} meter`;
  }

  get isAttendanceCooldownActive(): boolean {
    return this.attendanceCooldownRemaining > 0;
  }

  get checkInButtonText(): string {
    if (this.isCheckingIn) {
      return 'Memproses...';
    }

    if (this.isAttendanceCooldownActive) {
      return `Coba lagi ${this.attendanceCooldownRemaining} detik`;
    }

    return 'Masuk';
  }

  get checkOutButtonText(): string {
    if (this.isCheckingOut) {
      return 'Memproses...';
    }

    if (this.isAttendanceCooldownActive) {
      return `Coba lagi ${this.attendanceCooldownRemaining} detik`;
    }

    return 'Pulang';
  }

  get userMarkerStyle(): Record<string, string> {
    if (!this.currentLocation) {
      return {};
    }

    const latMeter = (this.currentLocation.lat - this.attendanceArea.latitude) * 110540;
    const lngMeter =
      (this.currentLocation.lng - this.attendanceArea.longitude) *
      111320 *
      Math.cos((this.attendanceArea.latitude * Math.PI) / 180);

    const left = this.clamp(50 + (lngMeter / this.mapPreviewRangeMeter) * 50, 7, 93);
    const top = this.clamp(50 - (latMeter / this.mapPreviewRangeMeter) * 50, 7, 93);

    return {
      left: `${left}%`,
      top: `${top}%`,
    };
  }

  ionViewWillEnter(): void {
    this.startClock();
    void this.offlineSync.syncWhenOnline();
    this.loadTodayAttendance();
    this.loadAttendanceHistory();
  }

  ionViewWillLeave(): void {
    this.stopClock();
    this.stopAttendanceCooldown();
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
      message: 'Mengambil lokasi masuk...',
      spinner: 'circular',
    });

    await loading.present();

    try {
      const location = await this.locationService.getCurrentPositionPromise();
      this.currentLocation = location;

      if (!this.isLocationInsideAttendanceArea(location)) {
        await loading.dismiss();
        await this.showToast(
          `Presensi belum bisa diproses. Lokasi kamu ${this.distanceText}, masih di luar area presensi ${this.attendanceArea.name}. Coba lagi dalam ${this.attendanceCooldownSeconds} detik.`,
          'warning'
        );
        this.startAttendanceCooldown();
        this.isCheckingIn = false;
        return;
      }

      const payload = {
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
      };

      this.api.post<any>('attendance/check-in', payload).subscribe({
        next: async (response) => {
          await loading.dismiss();

          if (response?.queued) {
            await this.showToast('Presensi masuk disimpan offline dan akan disinkronkan saat koneksi stabil.', 'warning');
            this.isCheckingIn = false;
            return;
          }

          const data = this.extractData(response);

          this.todayAttendance = {
            ...this.todayAttendance,
            date: this.formatDate(new Date().toISOString()),
            status: 'Masuk',
            checkIn: this.formatTime(data?.check_in ?? data?.checkIn ?? new Date().toISOString()),
            checkInLatitude: location.lat,
            checkInLongitude: location.lng,
          };

          await this.showToast('Presensi masuk berhasil dengan lokasi.', 'success');
          this.loadTodayAttendance();
          this.loadAttendanceHistory();
          this.isCheckingIn = false;
        },
        error: async (error) => {
          await loading.dismiss();

          await this.showToast(this.getErrorMessage(error, 'Gagal mencatat presensi masuk.'), 'danger');
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
      message: 'Mengambil lokasi pulang...',
      spinner: 'circular',
    });

    await loading.present();

    try {
      const location = await this.locationService.getCurrentPositionPromise();
      this.currentLocation = location;

      if (!this.isLocationInsideAttendanceArea(location)) {
        await loading.dismiss();
        await this.showToast(
          `Presensi pulang belum bisa diproses. Lokasi kamu ${this.distanceText}, masih di luar area presensi ${this.attendanceArea.name}. Coba lagi dalam ${this.attendanceCooldownSeconds} detik.`,
          'warning'
        );
        this.startAttendanceCooldown();
        this.isCheckingOut = false;
        return;
      }

      const payload = {
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
      };

      this.api.post<any>('attendance/check-out', payload).subscribe({
        next: async (response) => {
          await loading.dismiss();

          if (response?.queued) {
            await this.showToast('Presensi pulang disimpan offline dan akan disinkronkan saat koneksi stabil.', 'warning');
            this.isCheckingOut = false;
            return;
          }

          const data = this.extractData(response);

          this.todayAttendance = {
            ...this.todayAttendance,
            status: 'Selesai',
            checkOut: this.formatTime(data?.check_out ?? data?.checkOut ?? new Date().toISOString()),
            checkOutLatitude: location.lat,
            checkOutLongitude: location.lng,
          };

          await this.showToast('Presensi pulang berhasil dengan lokasi.', 'success');
          this.loadTodayAttendance();
          this.loadAttendanceHistory();
          this.isCheckingOut = false;
        },
        error: async (error) => {
          await loading.dismiss();

          await this.showToast(this.getErrorMessage(error, 'Gagal mencatat presensi pulang.'), 'danger');
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

    this.api.get<any>('dashboard').subscribe({
      next: (response) => {
        const data = this.extractData(response);
        const attendance = data?.attendance_today ?? data;

        if (attendance) {
          this.todayAttendance = this.mapTodayAttendance(attendance);
        }

        this.isLoading = false;
      },
      error: () => {
        this.todayAttendance = {
          date: this.formatDate(new Date().toISOString()),
          status: 'Belum Masuk',
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
        const list = Array.isArray(data) ? data : data?.data ?? data?.items ?? data?.attendance ?? [];

        this.attendanceHistory = list.map((item: any) => this.mapAttendanceLog(item));
      },
      error: async (error) => {
        this.attendanceHistory = [];
        await this.showToast(this.getErrorMessage(error, 'Gagal memuat riwayat absensi dari database.'), 'danger');
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
      checkIn: this.formatTime(data?.check_in ?? data?.checkIn ?? data?.check_in_time),
      checkOut: this.formatTime(data?.check_out ?? data?.checkOut ?? data?.check_out_time),
      checkInLatitude: this.toNumberOrNull(data?.check_in_latitude ?? data?.checkInLatitude ?? data?.latitude_in ?? data?.coordinates_in?.latitude),
      checkInLongitude: this.toNumberOrNull(data?.check_in_longitude ?? data?.checkInLongitude ?? data?.longitude_in ?? data?.coordinates_in?.longitude),
      checkOutLatitude: this.toNumberOrNull(data?.check_out_latitude ?? data?.checkOutLatitude ?? data?.latitude_out ?? data?.coordinates_out?.latitude),
      checkOutLongitude: this.toNumberOrNull(data?.check_out_longitude ?? data?.checkOutLongitude ?? data?.longitude_out ?? data?.coordinates_out?.longitude),
    };
  }

  private mapAttendanceLog(item: any): AttendanceLog {
    return {
      id: item?.id,
      date: this.formatDate(item?.date ?? item?.attendance_date ?? item?.created_at),
      checkIn: this.formatTime(item?.check_in ?? item?.checkIn),
      checkOut: this.formatTime(item?.check_out ?? item?.checkOut),
      status: this.normalizeStatus(item?.status ?? item?.attendance_status),
      latitude: this.toNumberOrNull(item?.check_in_latitude ?? item?.latitude_in ?? item?.latitude),
      longitude: this.toNumberOrNull(item?.check_in_longitude ?? item?.longitude_in ?? item?.longitude),
    };
  }

  private normalizeStatus(status: string): string {
    const value = String(status || '').toLowerCase();

    if (value.includes('selesai') || value.includes('completed')) {
      return 'Selesai';
    }

    if (value.includes('check') || value.includes('hadir') || value.includes('present')) {
      return 'Masuk';
    }

    if (value.includes('late') || value.includes('terlambat')) {
      return 'Terlambat';
    }

    return 'Belum Masuk';
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

  private startAttendanceCooldown(): void {
    this.stopAttendanceCooldown();
    this.attendanceCooldownRemaining = this.attendanceCooldownSeconds;

    this.cooldownTimer = setInterval(() => {
      this.attendanceCooldownRemaining -= 1;

      if (this.attendanceCooldownRemaining <= 0) {
        this.stopAttendanceCooldown();
      }
    }, 1000);
  }

  private stopAttendanceCooldown(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = undefined;
    }

    this.attendanceCooldownRemaining = 0;
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

  private isLocationInsideAttendanceArea(location: GeoPosition): boolean {
    const distance = this.calculateDistanceMeter(
      location.lat,
      location.lng,
      this.attendanceArea.latitude,
      this.attendanceArea.longitude
    );

    return distance <= this.effectiveAttendanceRadiusMeter;
  }

  private get effectiveAttendanceRadiusMeter(): number {
    return this.attendanceArea.radiusMeter + this.gpsToleranceMeter;
  }

  private calculateDistanceMeter(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const earthRadiusMeter = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeter * c;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private getErrorMessage(error: any, fallback: string): string {
    const message = error?.error?.message || error?.message;
    const validation = error?.error?.data;

    if (validation && typeof validation === 'object') {
      const firstKey = Object.keys(validation)[0];
      const firstMessage = Array.isArray(validation[firstKey])
        ? validation[firstKey][0]
        : validation[firstKey];

      if (firstMessage) {
        return firstMessage;
      }
    }

    if (message) {
      return message;
    }

    return `${fallback} Pastikan sudah login dan koneksi ke server stabil.`;
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
