import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';

interface AdminDashboardData {
  total_karyawan: number;
  hadir_hari_ini: number;
  cuti_pending: number;
  payroll_bulan_ini: number;
  chart: {
    hadir: number;
    izin: number;
    sakit: number;
    tanpa_keterangan: number;
  };
  recent_activity: {
    id: number;
    type: 'cuti' | 'lembur';
    user_name: string;
    description: string;
    status: string;
    created_at: string;
  }[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  dashboard: AdminDashboardData | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  currentDate = new Date();

  constructor(
    private userService: UserService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.error = false;

    this.userService.getDashboardStats().subscribe({
      next: (res) => {
        this.dashboard = {
          total_karyawan: 128,
          hadir_hari_ini: 112,
          cuti_pending: 5,
          payroll_bulan_ini: 875000000,
          chart: { hadir: 98, izin: 12, sakit: 8, tanpa_keterangan: 10 },
          recent_activity: [
            { id: 1, type: 'cuti', user_name: 'Budi Santoso', description: 'Cuti Tahunan - 3 hari', status: 'pending', created_at: '2026-05-22T08:30:00' },
            { id: 2, type: 'lembur', user_name: 'Siti Rahmawati', description: 'Lembur proyek - 2 jam', status: 'pending', created_at: '2026-05-22T07:15:00' },
            { id: 3, type: 'cuti', user_name: 'Ahmad Fauzi', description: 'Cuti Sakit - 1 hari', status: 'approved', created_at: '2026-05-21T14:00:00' },
            { id: 4, type: 'lembur', user_name: 'Dewi Lestari', description: 'Lembur maintenance - 3 jam', status: 'approved', created_at: '2026-05-21T10:30:00' },
            { id: 5, type: 'cuti', user_name: 'Rudi Hermawan', description: 'Cuti Pribadi - 2 hari', status: 'rejected', created_at: '2026-05-20T16:45:00' },
          ],
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data dashboard';
      },
    });
  }

  doRefresh(event: any) {
    this.userService.getDashboardStats().subscribe({
      next: () => {
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  getActivityIcon(type: string): string {
    return type === 'cuti' ? 'calendar_month' : 'dark_mode';
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

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
