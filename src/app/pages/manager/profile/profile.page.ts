import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
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
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Ubah Password',
      inputs: [
        { name: 'current_password', type: 'password', placeholder: 'Password saat ini' },
        { name: 'new_password', type: 'password', placeholder: 'Password baru' },
        { name: 'confirm_password', type: 'password', placeholder: 'Konfirmasi password baru' },
      ],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Simpan',
          handler: (data) => {
            if (data.new_password !== data.confirm_password) {
              this.showToast('Konfirmasi password tidak cocok', 'danger');
              return false;
            }
            this.auth.changePassword(data).subscribe({
              next: () => {
                this.showToast('Password berhasil diubah', 'success');
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Gagal mengubah password', 'danger');
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
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin logout?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Logout',
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
    const labels: Record<string, string> = { manager: 'Manager', employee: 'Karyawan' };
    return labels[role || ''] || role || 'Manager';
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
}
