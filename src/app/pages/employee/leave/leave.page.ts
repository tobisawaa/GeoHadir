import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { LeaveService } from '../../../services/leave.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

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

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private offlineSync: OfflineSyncService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    // Jangan redirect dari lifecycle. Ini yang biasanya bikin halaman cuti mental balik ke dashboard.
  }

  async submitLeave(): Promise<void> {
    if (!this.form.startDate || !this.form.endDate || !this.form.reason.trim()) {
      await this.showToast('Lengkapi tanggal dan alasan cuti dulu.', 'warning');
      return;
    }

    const payload = {
      type: this.toApiLeaveType(this.form.type),
      start_date: this.form.startDate,
      end_date: this.form.endDate,
      reason: this.form.reason.trim(),
    };

    this.leaveService.submit(payload).subscribe({
      next: async (response: any) => {
        const data = response?.data;

        this.recentRequests = [{
          id: data?.id ?? Date.now(),
          type: this.form.type,
          period: `${this.form.startDate} - ${this.form.endDate}`,
          reason: this.form.reason,
          status: 'Menunggu',
        }, ...this.recentRequests];

        this.pendingLeave += 1;
        this.form = { type: 'Cuti Tahunan', startDate: '', endDate: '', reason: '' };
        await this.showToast('Pengajuan cuti disimpan dan akan tersinkron otomatis.', 'success');
      },
      error: async (error) => {
        const message =
          error?.error?.message ||
          error?.message ||
          'Gagal mengirim pengajuan cuti.';

        await this.showToast(message, 'danger');
      },
    });
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  trackByLeaveRequest(index: number, item: LeaveRequest): number | string {
    return item.id ?? `${item.period}-${index}`;
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2400, color, position: 'top' });
    await toast.present();
  }

  private toApiLeaveType(type: string): 'annual' | 'sick' | 'personal' | 'maternity' | 'other' {
    const labels: Record<string, 'annual' | 'sick' | 'personal' | 'other'> = {
      'Cuti Tahunan': 'annual',
      Sakit: 'sick',
      Izin: 'personal',
    };

    return labels[type] || 'other';
  }
}
