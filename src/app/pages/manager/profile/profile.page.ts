import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/models';

@Component({
  selector: 'app-manager-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private offlineSync: OfflineSyncService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
  }

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        const user = response?.data ?? response;
        this.user = this.normalizeUser(user);
      },
      error: async () => {
        this.user = this.auth.getCurrentUser();
        await this.showToast('Gagal memuat profil terbaru dari server.', 'warning');
      },
    });
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Ubah Kata Sandi',
      inputs: [
        { name: 'current_password', type: 'password', placeholder: 'Kata sandi saat ini' },
        { name: 'new_password', type: 'password', placeholder: 'Kata sandi baru' },
        { name: 'confirm_password', type: 'password', placeholder: 'Konfirmasi kata sandi baru' },
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Simpan',
          handler: (data) => {
            if (data.new_password !== data.confirm_password) {
              this.showToast('Konfirmasi kata sandi tidak cocok', 'danger');
              return false;
            }
            this.auth.changePassword(data).subscribe({
              next: () => {
                this.showToast('Kata sandi berhasil diubah', 'success');
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Gagal mengubah kata sandi', 'danger');
              },
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          handler: () => {
            this.auth.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }

  getInitials(): string {
    if (!this.user?.name) return 'M';
    return this.user.name.charAt(0).toUpperCase();
  }

  getRoleLabel(role?: string): string {
    const labels: Record<string, string> = { manager: 'Manajer', employee: 'Karyawan' };
    return labels[role || ''] || role || 'Manajer';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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

  private normalizeUser(user: any): User {
    return {
      ...user,
      department: typeof user?.department === 'object'
        ? user.department?.name
        : user?.department ?? '',
      position: typeof user?.position === 'object'
        ? user.position?.title
        : user?.position ?? '',
      phone: user?.phone ?? '',
      join_date: user?.join_date ?? '',
    } as User;
  }
}
