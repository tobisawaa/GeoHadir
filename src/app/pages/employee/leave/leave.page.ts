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
  usedLeave = 0;
  pendingLeave = 0;

  form = {
    type: 'Cuti Tahunan',
    startDate: '',
    endDate: '',
    reason: '',
  };

  recentRequests: LeaveRequest[] = [];

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private offlineSync: OfflineSyncService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadLeaveData();
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
        this.loadLeaveData();
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

  private loadLeaveData(): void {
    this.leaveService.getMyLeaves().subscribe({
      next: (response: any) => {
        const data = this.extractData(response);
        const list = Array.isArray(data) ? data : data?.items ?? data?.leaves ?? [];

        this.recentRequests = list.map((item: any) => this.mapLeaveRequest(item));
        this.pendingLeave = this.recentRequests.filter((item) => item.status === 'Menunggu').length;
        this.usedLeave = this.recentRequests.filter((item) => item.status === 'Disetujui').length;
      },
      error: async (error) => {
        this.recentRequests = [];
        this.pendingLeave = 0;
        this.usedLeave = 0;
        await this.showToast(error?.error?.message || 'Gagal memuat data cuti dari database.', 'danger');
      },
    });
  }

  private mapLeaveRequest(item: any): LeaveRequest {
    return {
      id: item?.id,
      type: this.fromApiLeaveType(item?.type),
      period: `${this.formatDate(item?.start_date)} - ${this.formatDate(item?.end_date)}`,
      reason: item?.reason ?? '-',
      status: this.normalizeStatus(item?.status),
    };
  }

  private fromApiLeaveType(type: string): string {
    const labels: Record<string, string> = {
      annual: 'Cuti Tahunan',
      sick: 'Sakit',
      personal: 'Izin',
      maternity: 'Cuti Melahirkan',
      other: 'Cuti Lainnya',
    };

    return labels[String(type || '').toLowerCase()] || 'Cuti';
  }

  private normalizeStatus(status: string): LeaveRequest['status'] {
    const value = String(status || '').toLowerCase();

    if (value === 'approved' || value === 'disetujui') {
      return 'Disetujui';
    }

    if (value === 'rejected' || value === 'ditolak') {
      return 'Ditolak';
    }

    return 'Menunggu';
  }

  private extractData(response: any): any {
    if (response?.data !== undefined) {
      return response.data;
    }

    return response;
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
