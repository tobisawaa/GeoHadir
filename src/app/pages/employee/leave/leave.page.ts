import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface LeaveRequest {
  id: number;
  type: string;
  period: string;
  reason: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
}

@Component({
  selector: 'app-leave',
  templateUrl: './leave.page.html',
  styleUrls: ['./leave.page.scss'],
  standalone: false,
})
export class LeavePage implements OnInit {
  leaveBalance = 8;
  usedLeave = 4;
  pendingLeave = 1;

  form = {
    type: 'Cuti Tahunan',
    startDate: '',
    endDate: '',
    reason: '',
  };

  recentRequests: LeaveRequest[] = [
    { id: 1, type: 'Cuti Tahunan', period: '15 Jun 2026 - 17 Jun 2026', reason: 'Keperluan keluarga', status: 'Menunggu' },
    { id: 2, type: 'Sakit', period: '10 Mei 2026 - 11 Mei 2026', reason: 'Pemeriksaan kesehatan', status: 'Disetujui' },
  ];

  constructor(private router: Router, private toastCtrl: ToastController) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    // Jangan redirect dari lifecycle. Ini yang biasanya bikin halaman cuti mental balik ke dashboard.
  }

  async submitLeave(): Promise<void> {
    if (!this.form.startDate || !this.form.endDate || !this.form.reason.trim()) {
      await this.showToast('Lengkapi tanggal dan alasan cuti dulu.', 'warning');
      return;
    }

    this.recentRequests = [{
      id: Date.now(),
      type: this.form.type,
      period: `${this.form.startDate} - ${this.form.endDate}`,
      reason: this.form.reason,
      status: 'Menunggu',
    }, ...this.recentRequests];

    this.pendingLeave += 1;
    this.form = { type: 'Cuti Tahunan', startDate: '', endDate: '', reason: '' };
    await this.showToast('[BACKEND] Pengajuan cuti dikirim dengan status pending.', 'success');
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2400, color, position: 'top' });
    await toast.present();
  }
}
