import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../../../services/api.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

interface OvertimeForm {
  date: string;
  duration: number;
  reason: string;
}

interface OvertimeRequest {
  id?: number;
  date: string;
  duration: number;
  reason: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak' | string;
}

@Component({
  selector: 'app-overtime',
  templateUrl: './overtime.page.html',
  styleUrls: ['./overtime.page.scss'],
  standalone: false,
})
export class OvertimePage implements OnInit {
  approvedOvertime = 0;
  pendingOvertime = 0;
  isLoading = false;

  form: OvertimeForm = {
    date: '',
    duration: 1,
    reason: '',
  };

  recentRequests: OvertimeRequest[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private offlineSync: OfflineSyncService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.setDefaultDate();
  }

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadOvertimeData();
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  trackByOvertimeRequest(index: number, item: OvertimeRequest): number | string {
    return item.id ?? `${item.date}-${index}`;
  }

  async submitOvertime(): Promise<void> {
    if (!this.form.date || !this.form.duration || !this.form.reason.trim()) {
      await this.showToast('Tanggal, durasi, dan alasan lembur wajib diisi.', 'warning');
      return;
    }

    if (Number(this.form.duration) < 1) {
      await this.showToast('Durasi lembur minimal 1 jam.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mengirim pengajuan lembur...',
      spinner: 'circular',
    });

    await loading.present();

    const payload = {
      date: this.form.date,
      duration_hours: Number(this.form.duration),
      reason: this.form.reason.trim(),
    };

    this.api.post<any>('overtimes/apply', payload).subscribe({
      next: async (response) => {
        await loading.dismiss();

        const createdData = this.extractData(response);

        this.recentRequests.unshift({
          id: createdData?.id ?? Date.now(),
          date: this.formatDate(payload.date),
          duration: payload.duration_hours,
          reason: payload.reason,
          status: this.normalizeStatus(createdData?.status ?? 'pending'),
        });

        this.pendingOvertime += 1;
        this.resetForm();

        await this.showToast('Pengajuan lembur berhasil dikirim.', 'success');
      },
      error: async (error) => {
        await loading.dismiss();

        const message =
          error?.error?.message ||
          error?.message ||
          'Gagal mengirim pengajuan lembur. Pastikan backend API sudah berjalan.';

        await this.showToast(message, 'danger');
      },
    });
  }

  private loadOvertimeData(): void {
    this.isLoading = true;

    this.api.get<any>('overtimes/history').subscribe({
      next: (response) => {
        const data = this.extractData(response);
        const list = Array.isArray(data) ? data : data?.items ?? data?.overtimes ?? [];

        this.recentRequests = list.map((item: any) => this.mapOvertimeItem(item));
        this.calculateSummary(this.recentRequests);
        this.isLoading = false;
      },
      error: async (error) => {
        this.recentRequests = [];
        this.calculateSummary(this.recentRequests);
        this.isLoading = false;
        await this.showToast(error?.error?.message || 'Gagal memuat data lembur dari database.', 'danger');
      },
    });
  }

  private calculateSummary(items: OvertimeRequest[]): void {
    this.approvedOvertime = items
      .filter((item) => item.status === 'Disetujui')
      .reduce((total, item) => total + Number(item.duration || 0), 0);

    this.pendingOvertime = items.filter((item) => item.status === 'Menunggu').length;
  }

  private mapOvertimeItem(item: any): OvertimeRequest {
    return {
      id: item?.id,
      date: this.formatDate(item?.date ?? item?.overtime_date ?? item?.created_at ?? ''),
      duration: Number(item?.duration ?? item?.duration_hours ?? item?.hours ?? 0),
      reason: item?.reason ?? item?.description ?? '-',
      status: this.normalizeStatus(item?.status),
    };
  }

  private normalizeStatus(status: string): string {
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

  private setDefaultDate(): void {
    if (this.form.date) {
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');

    this.form.date = `${year}-${month}-${date}`;
  }

  private resetForm(): void {
    this.form = {
      date: '',
      duration: 1,
      reason: '',
    };

    this.setDefaultDate();
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
      month: 'long',
      year: 'numeric',
    });
  }

  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });

    await toast.present();
  }
}
