import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  employee = {
    name: 'Karyawan',
    employeeId: '-',
    position: 'Karyawan',
    department: '-',
    email: '-',
    phone: '-',
    manager: '-',
    workLocation: '-',
  };

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private auth: AuthService,
    private offlineSync: OfflineSyncService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    this.loadCurrentUser();
    void this.offlineSync.syncWhenOnline();
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  async logout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Keluar Akun?',
      message: 'Anda akan keluar dari aplikasi dan kembali ke halaman login.',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Keluar',
          role: 'destructive',
          handler: () => {
            this.auth.logout();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }

  private loadCurrentUser(): void {
    const user = this.auth.getCurrentUser();

    this.employee = {
      ...this.employee,
      name: user?.name || 'Karyawan',
      employeeId: this.stringifyValue(user?.employee_code || user?.employee_id || user?.id),
      position: user?.position || 'Karyawan',
      department: user?.department || '-',
      email: user?.email || '-',
      phone: user?.phone || '-',
      manager: user?.manager_name || user?.manager || '-',
      workLocation: user?.work_location || user?.location || '-',
    };
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }
}
