import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { LeaveService } from '../../../services/leave.service';
import { LeaveRequest } from '../../../interfaces/models';

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.page.html',
  styleUrls: ['./leave-management.page.scss'],
  standalone: false,
})
export class LeaveManagementPage implements OnInit {
  leaves: LeaveRequest[] = [];
  filteredLeaves: LeaveRequest[] = [];
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private leaveService: LeaveService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.loading = true;
    this.error = false;

    this.leaveService.getTeamLeaves().subscribe({
      next: (res) => {
        this.leaves = res.data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data cuti';
      },
    });
  }

  doRefresh(event: any) {
    this.leaveService.getTeamLeaves().subscribe({
      next: (res) => {
        this.leaves = res.data;
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
      this.filteredLeaves = [...this.leaves];
    } else {
      this.filteredLeaves = this.leaves.filter((l) => l.status === this.activeFilter);
    }
  }

  async approveLeave(leave: LeaveRequest) {
    const alert = await this.alertCtrl.create({
      header: 'Setujui Cuti',
      message: `Setujui pengajuan cuti ${leave.user_name || 'karyawan'}?`,
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
      message: `Tolak pengajuan cuti ${leave.user_name || 'karyawan'}?`,
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

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
