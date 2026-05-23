import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface AttendanceLog {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Tepat Waktu' | 'Terlambat';
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  standalone: false,
})
export class AttendancePage implements OnInit {
  currentTime = '08:42 AM';
  locationStatus = 'Lokasi Terdeteksi · Kantor Pusat';
  checkedIn = false;
  checkedOut = false;

  logs: AttendanceLog[] = [
    { id: 1, date: '24 Okt 2026', checkIn: '08:42 AM', checkOut: '--:-- PM', status: 'Tepat Waktu' },
    { id: 2, date: '23 Okt 2026', checkIn: '09:15 AM', checkOut: '05:30 PM', status: 'Terlambat' },
    { id: 3, date: '20 Okt 2026', checkIn: '08:50 AM', checkOut: '06:05 PM', status: 'Tepat Waktu' },
  ];

  constructor(private router: Router, private toastCtrl: ToastController) {}

  ngOnInit(): void {}

  async checkIn(): Promise<void> {
    this.checkedIn = true;
    await this.showToast('[BACKEND] Check-in dikirim bersama latitude dan longitude.', 'success');
  }

  async checkOut(): Promise<void> {
    this.checkedOut = true;
    await this.showToast('[BACKEND] Check-out dikirim bersama latitude dan longitude.', 'success');
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2400, color, position: 'top' });
    await toast.present();
  }
}
