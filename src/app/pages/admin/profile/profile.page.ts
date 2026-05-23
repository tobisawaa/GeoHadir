import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/models';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.error = false;

    this.userService.getProfile().subscribe({
      next: (res) => {
        this.user = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat profil';
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  getInitials(): string {
    if (!this.user?.name) return '?';
    return this.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      employee: 'Karyawan',
      manager: 'Manajer',
      admin: 'Admin',
    };
    return labels[role] || role;
  }

  editProfile() {
    const alert = this.alertCtrl.create({
      header: 'Edit Profil',
      message: 'Fitur edit profil akan tersedia segera.',
      buttons: ['OK'],
    });
    alert.then((a) => a.present());
  }

  changePassword() {
    const alert = this.alertCtrl.create({
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
    alert.then((a) => a.present());
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

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
