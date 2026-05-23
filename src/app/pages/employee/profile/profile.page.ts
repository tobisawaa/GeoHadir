import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  employee = {
    name: 'Muhamad Ridho',
    employeeId: 'EMP-2026-001',
    position: 'Frontend Developer',
    department: 'Information Technology',
    email: 'employee@geohadir.com',
    phone: '0812-3456-7890',
    manager: 'Manager Demo',
    workLocation: 'Jakarta Office',
  };

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private auth: AuthService
  ) {}

  ngOnInit(): void {}

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
          text: 'Logout',
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
}