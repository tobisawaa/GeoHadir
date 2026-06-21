import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

import { AuthService } from './services/auth.service';
import { User } from './interfaces/models';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;
  appPages: MenuItem[] = [];
  userInitials = '';
  roleLabel = '';
  private exitAlertOpen = false;

  constructor(
    private auth: AuthService,
    public router: Router,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.auth.currentUser$.subscribe((user) => {
      this.user = user;
      this.isLoggedIn = !!user;

      if (user) {
        this.userInitials = this.getInitials(user.name);
        this.roleLabel = this.getRoleLabel(user.role);
      }

      this.buildMenu();
    });
  }

  private async initializeApp(): Promise<void> {
    await this.platform.ready();

    if (this.platform.is('capacitor')) {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#f5f8ff' });
      await StatusBar.setStyle({ style: Style.Dark });
    }

    setTimeout(async () => {
      try {
        await SplashScreen.hide();
      } catch {
        // Browser testing biasanya tidak butuh native splash. Diam saja, tidak usah drama.
      }
    }, 500);

    this.registerHardwareBackButton();
  }

  private registerHardwareBackButton(): void {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const url = this.router.url.split('?')[0].split('#')[0];

      if (this.isExitConfirmationRoute(url)) {
        await this.confirmExitApp();
        return;
      }

      window.history.back();
    });
  }

  private isExitConfirmationRoute(url: string): boolean {
    return [
      '/',
      '/welcome',
      '/login',
      '/app/employee/dashboard',
      '/app/manager/dashboard',
    ].includes(url);
  }

  private async confirmExitApp(): Promise<void> {
    if (this.exitAlertOpen) {
      return;
    }

    this.exitAlertOpen = true;

    const alert = await this.alertCtrl.create({
      header: 'Keluar Aplikasi?',
      message: 'Anda yakin ingin menutup GeoHadir?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          role: 'destructive',
          handler: () => {
            void App.exitApp();
          },
        },
      ],
    });

    alert.onDidDismiss().then(() => {
      this.exitAlertOpen = false;
    });

    await alert.present();
  }

  private getInitials(name: string | undefined): string {
    if (!name) return 'U';

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  }

  private getRoleLabel(role: string | undefined): string {
    const labels: Record<string, string> = {
      employee: 'Karyawan',
      manager: 'Manajer',
    };

    return labels[role || ''] || role || 'Pengguna';
  }

  private buildMenu() {
    const role = this.auth.getRole();

    if (role === 'employee') {
      this.appPages = [
        { title: 'Beranda', url: '/app/employee/dashboard', icon: 'grid-outline' },
        { title: 'Absensi', url: '/app/employee/attendance', icon: 'camera-outline' },
        { title: 'Riwayat Absensi', url: '/app/employee/attendance-history', icon: 'time-outline' },
        { title: 'Pengajuan Cuti', url: '/app/employee/leave', icon: 'calendar-outline' },
        { title: 'Riwayat Cuti', url: '/app/employee/leave-history', icon: 'document-text-outline' },
        { title: 'Pengajuan Lembur', url: '/app/employee/overtime', icon: 'moon-outline' },
        { title: 'Riwayat Lembur', url: '/app/employee/overtime-history', icon: 'time-outline' },
        { title: 'Slip Gaji', url: '/app/employee/payslip', icon: 'wallet-outline' },
        { title: 'Riwayat Gaji', url: '/app/employee/payroll-history', icon: 'receipt-outline' },
        { title: 'Profil', url: '/app/employee/profile', icon: 'person-outline' },
      ];
    } else if (role === 'manager') {
      this.appPages = [
        { title: 'Beranda', url: '/app/manager/dashboard', icon: 'grid-outline' },
        { title: 'Tim Saya', url: '/app/manager/team', icon: 'people-outline' },
        { title: 'Absensi Tim', url: '/app/manager/team-attendance', icon: 'camera-outline' },
        { title: 'Cuti Bawahan', url: '/app/manager/team-leave', icon: 'calendar-outline' },
        { title: 'Lembur Bawahan', url: '/app/manager/team-overtime', icon: 'moon-outline' },
        { title: 'Profil', url: '/app/manager/profile', icon: 'person-outline' },
      ];
    } else {
      this.appPages = [];
    }
  }

  isActive(url: string): boolean {
    return this.router.url === url || this.router.url.startsWith(url + '/');
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  async logout() {
    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
