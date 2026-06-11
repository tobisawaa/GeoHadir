import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { LeaveService } from '../../../services/leave.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { LeaveRequest } from '../../../interfaces/models';

@Component({
  selector: 'app-team-leave',
  templateUrl: './team-leave.page.html',
  styleUrls: ['./team-leave.page.scss'],
  standalone: false,
})
export class TeamLeavePage implements OnInit {
  leaves: LeaveRequest[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private leaveService: LeaveService,
    private offlineSync: OfflineSyncService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadLeaves();
  }

  loadLeaves() {
    this.loading = true;
    this.error = false;

    this.leaveService.getTeamLeaves().subscribe({
      next: (res) => {
        this.leaves = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data cuti';
      },
    });
  }

  async doRefresh(event: any) {
    this.leaveService.getTeamLeaves().subscribe({
      next: (res) => {
        this.leaves = res.data;
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  async approveLeave(leave: LeaveRequest) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Cuti',
      message: `Setujui pengajuan cuti ${leave.user_name || 'anggota tim'}?`,
      inputs: [
        { name: 'notes', type: 'textarea', placeholder: 'Catatan (opsional)' },
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Setujui',
          handler: (data) => {
            this.leaveService.approve(leave.id, data.notes || undefined).subscribe({
              next: () => {
                this.showToast('Cuti berhasil disetujui', 'success');
                this.loadLeaves();
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Gagal menyetujui cuti', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async rejectLeave(leave: LeaveRequest) {
    const alert = await this.alertCtrl.create({
      header: 'Tolak Cuti',
      message: `Tolak pengajuan cuti ${leave.user_name || 'anggota tim'}?`,
      inputs: [
        { name: 'notes', type: 'textarea', placeholder: 'Alasan penolakan (opsional)' },
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Tolak',
          role: 'destructive',
          handler: (data) => {
            this.leaveService.reject(leave.id, data.notes || undefined).subscribe({
              next: () => {
                this.showToast('Cuti berhasil ditolak', 'warning');
                this.loadLeaves();
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Gagal menolak cuti', 'danger');
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

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      annual: 'Cuti Tahunan',
      sick: 'Sakit',
      personal: 'Keperluan Pribadi',
      maternity: 'Melahirkan',
      other: 'Lainnya',
    };
    return labels[type] || type;
  }

  trackByLeave(index: number, leave: LeaveRequest): number | string {
    return leave.id ?? `${leave.user_id}-${leave.start_date}-${index}`;
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
