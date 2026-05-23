import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface OvertimeRequest {
  id: number;
  date: string;
  duration: number;
  reason: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
}

@Component({
  selector: 'app-overtime',
  templateUrl: './overtime.page.html',
  styleUrls: ['./overtime.page.scss'],
  standalone: false,
})
export class OvertimePage implements OnInit {
  approvedHours = 12;
  pendingRequest = 2;

  form = { date: '', duration: 1, reason: '' };

  recentRequests: OvertimeRequest[] = [
    { id: 1, date: '18 Mei 2026', duration: 2.5, reason: 'Deployment aplikasi', status: 'Disetujui' },
    { id: 2, date: '22 Mei 2026', duration: 3, reason: 'Closing laporan', status: 'Menunggu' },
  ];

  constructor(private router: Router, private toastCtrl: ToastController) {}

  ngOnInit(): void {}

  async submitOvertime(): Promise<void> {
    if (!this.form.date || !this.form.duration || !this.form.reason.trim()) {
      await this.showToast('Lengkapi tanggal, durasi, dan alasan lembur dulu.', 'warning');
      return;
    }

    this.recentRequests = [{ id: Date.now(), date: this.form.date, duration: Number(this.form.duration), reason: this.form.reason, status: 'Menunggu' }, ...this.recentRequests];
    this.pendingRequest += 1;
    this.form = { date: '', duration: 1, reason: '' };
    await this.showToast('[BACKEND] Pengajuan lembur dikirim dengan status pending.', 'success');
  }

  goTo(route: string): void { this.router.navigateByUrl(route); }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2400, color, position: 'top' });
    await toast.present();
  }
}
