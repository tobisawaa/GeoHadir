import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { OvertimeService } from '../../../services/overtime.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { OvertimeRequest } from '../../../interfaces/models';

@Component({
  selector: 'app-team-overtime',
  templateUrl: './team-overtime.page.html',
  styleUrls: ['./team-overtime.page.scss'],
  standalone: false,
})
export class TeamOvertimePage implements OnInit {
  overtimes: OvertimeRequest[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private overtimeService: OvertimeService,
    private offlineSync: OfflineSyncService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadOvertimes();
  }

  loadOvertimes() {
    this.loading = true;
    this.error = false;

    this.overtimeService.getTeamOvertimes().subscribe({
      next: (res) => {
        this.overtimes = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data lembur';
      },
    });
  }

  async doRefresh(event: any) {
    this.overtimeService.getTeamOvertimes().subscribe({
      next: (res) => {
        this.overtimes = res.data;
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  async approveOvertime(overtime: OvertimeRequest) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Lembur',
      message: `Setujui pengajuan lembur ${overtime.user_name || 'anggota tim'}?`,
      inputs: [
        { name: 'notes', type: 'textarea', placeholder: 'Catatan (opsional)' },
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Setujui',
          handler: (data) => {
            this.overtimeService.approve(overtime.id, data.notes || undefined).subscribe({
              next: () => {
                this.showToast('Lembur berhasil disetujui', 'success');
                this.loadOvertimes();
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Gagal menyetujui lembur', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async rejectOvertime(overtime: OvertimeRequest) {
    const alert = await this.alertCtrl.create({
      header: 'Tolak Lembur',
      message: `Tolak pengajuan lembur ${overtime.user_name || 'anggota tim'}?`,
      inputs: [
        { name: 'notes', type: 'textarea', placeholder: 'Alasan penolakan (opsional)' },
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Tolak',
          role: 'destructive',
          handler: (data) => {
            this.overtimeService.reject(overtime.id, data.notes || undefined).subscribe({
              next: () => {
                this.showToast('Lembur berhasil ditolak', 'warning');
                this.loadOvertimes();
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Gagal menolak lembur', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  }

  trackByOvertime(index: number, overtime: OvertimeRequest): number | string {
    return overtime.id ?? `${overtime.user_id}-${overtime.date}-${index}`;
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
