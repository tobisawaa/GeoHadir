import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { LeaveService } from '../../../services/leave.service';
import { OvertimeService } from '../../../services/overtime.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { LeaveRequest, OvertimeRequest } from '../../../interfaces/models';

@Component({
  selector: 'app-team-leave',
  templateUrl: './team-leave.page.html',
  styleUrls: ['./team-leave.page.scss'],
  standalone: false,
})
export class TeamLeavePage implements OnInit {
  leaves: LeaveRequest[] = [];
  overtimes: OvertimeRequest[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private leaveService: LeaveService,
    private overtimeService: OvertimeService,
    private offlineSync: OfflineSyncService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadApprovals();
  }

  loadApprovals() {
    this.loading = true;
    this.error = false;

    forkJoin({
      leaves: this.leaveService.getTeamLeaves(),
      overtimes: this.overtimeService.getTeamOvertimes(),
    }).subscribe({
      next: ({ leaves, overtimes }) => {
        this.leaves = this.extractList(leaves).map((item) => this.mapLeave(item));
        this.overtimes = this.extractList(overtimes).map((item) => this.mapOvertime(item));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data persetujuan';
      },
    });
  }

  loadLeaves() {
    this.loadApprovals();
  }

  async doRefresh(event: any) {
    forkJoin({
      leaves: this.leaveService.getTeamLeaves(),
      overtimes: this.overtimeService.getTeamOvertimes(),
    }).subscribe({
      next: ({ leaves, overtimes }) => {
        this.leaves = this.extractList(leaves).map((item) => this.mapLeave(item));
        this.overtimes = this.extractList(overtimes).map((item) => this.mapOvertime(item));
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
                this.loadApprovals();
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
                this.loadApprovals();
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
                this.loadApprovals();
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
                this.loadApprovals();
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

  private extractList(response: any): any[] {
    const data = response?.data !== undefined ? response.data : response;
    return Array.isArray(data) ? data : data?.data ?? data?.items ?? data?.leaves ?? [];
  }

  private mapLeave(item: any): LeaveRequest {
    return {
      ...item,
      user_name: item?.user_name ?? item?.user?.name ?? 'Anggota Tim',
      type: item?.type ?? 'other',
      reason: item?.reason ?? '-',
      status: item?.status ?? 'pending',
    } as LeaveRequest;
  }

  private mapOvertime(item: any): OvertimeRequest {
    return {
      ...item,
      user_name: item?.user_name ?? item?.user?.name ?? 'Anggota Tim',
      duration_hours: Number(item?.duration_hours ?? 0),
      reason: item?.reason ?? '-',
      status: item?.status ?? 'pending',
    } as OvertimeRequest;
  }
}
