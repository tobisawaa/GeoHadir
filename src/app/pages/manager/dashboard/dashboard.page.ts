import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { ManagerDashboardData } from '../../../interfaces/models';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  dashboard: ManagerDashboardData | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  userName = 'Manajer';
  userInitial = 'M';

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private offlineSync: OfflineSyncService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.userName = user?.name ?? 'Manajer';
    this.userInitial = this.userName.trim().charAt(0).toUpperCase() || 'M';
  }

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.error = false;

    this.userService.getManagerDashboard().subscribe({
      next: (res) => {
        this.dashboard = this.extractData(res);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data dashboard';
      },
    });
  }

  async doRefresh(event: any) {
    this.userService.getManagerDashboard().subscribe({
      next: (res) => {
        this.dashboard = this.extractData(res);
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  trackByDashboardMember(index: number, member: any): number | string {
    return member?.id ?? member?.employee_id ?? member?.user_id ?? `${member?.name || 'member'}-${index}`;
  }

  getTotalMembers(): number {
    const stats = this.dashboard?.team_stats;

    return stats?.total_members ?? ((stats?.total_present || 0) + (stats?.total_absent || 0));
  }

  getAttendanceText(status?: string | null): string {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'late':
        return 'Terlambat';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return 'Belum Ada Data';
    }
  }

  private extractData(response: any): ManagerDashboardData {
    return response?.data !== undefined ? response.data : response;
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}
