import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { OvertimeService } from '../../../services/overtime.service';
import { OvertimeRequest } from '../../../interfaces/models';

@Component({
  selector: 'app-overtime-management',
  templateUrl: './overtime-management.page.html',
  styleUrls: ['./overtime-management.page.scss'],
  standalone: false,
})
export class OvertimeManagementPage implements OnInit {
  overtimes: OvertimeRequest[] = [];
  filteredOvertimes: OvertimeRequest[] = [];
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private overtimeService: OvertimeService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadOvertimes();
  }

  loadOvertimes() {
    this.loading = true;
    this.error = false;

    this.overtimeService.getTeamOvertimes().subscribe({
      next: (res) => {
        this.overtimes = res.data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data lembur';
      },
    });
  }

  doRefresh(event: any) {
    this.overtimeService.getTeamOvertimes().subscribe({
      next: (res) => {
        this.overtimes = res.data;
        this.applyFilter();
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredOvertimes = [...this.overtimes];
    } else {
      this.filteredOvertimes = this.overtimes.filter((o) => o.status === this.activeFilter);
    }
  }

  async approveOvertime(overtime: OvertimeRequest) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Lembur',
      message: `Setujui pengajuan lembur ${overtime.user_name || 'karyawan'}?`,
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
      message: `Tolak pengajuan lembur ${overtime.user_name || 'karyawan'}?`,
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

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
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
      case 'pending': return 'Pending';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  }

  formatHours(hours: number): string {
    return `${hours} jam`;
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
