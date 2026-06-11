import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../services/offline-sync.service';
import { AuthService } from '../../services/auth.service';

interface WelcomeSlide {
  badge: string;
  title: string;
  description: string;
  icon: string;
  points: string[];
  type: 'intro' | 'privacy';
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {
  private readonly welcomeKey = 'geohadir_welcome_done';
  private readonly privacyAcceptedKey = 'geohadir_privacy_accepted';

  // GANTI LINK INI DENGAN LINK PRIVACY POLICY KAMU
  private readonly privacyPolicyUrl = 'https://peridot-quokka-f8e.notion.site/GeoHadir-Privacy-Policy-37bcefef99d480089270c840c4f78432?pvs=74';

  activeSlide = 0;
  privacyAccepted = false;
  privacyOpened = false;

  slides: WelcomeSlide[] = [
    {
      type: 'intro',
      badge: 'HRIS Mobile',
      title: 'Kelola aktivitas HR dalam satu aplikasi',
      description:
        'GeoHadir membantu karyawan dan manager mengelola absensi, cuti, lembur, approval, dan slip gaji secara digital.',
      icon: 'GH',
      points: ['Absensi geolocation', 'Cuti dan lembur', 'Slip gaji karyawan'],
    },
    {
      type: 'intro',
      badge: 'Attendance',
      title: 'Presensi berbasis lokasi',
      description:
        'Check-in dan check-out dapat dilakukan dengan pencatatan lokasi untuk mendukung monitoring kehadiran yang lebih akurat.',
      icon: 'AT',
      points: ['Check-in', 'Check-out', 'Koordinat lokasi'],
    },
    {
      type: 'intro',
      badge: 'Approval',
      title: 'Pengajuan lebih terstruktur',
      description:
        'Karyawan dapat mengajukan cuti dan lembur, sementara manager dapat memantau serta memproses approval tim.',
      icon: 'AP',
      points: ['Approval cuti', 'Approval lembur', 'Status pengajuan'],
    },
    {
      type: 'privacy',
      badge: 'Privacy Policy',
      title: 'Privasi dan keamanan data',
      description:
        'Sebelum menggunakan GeoHadir, pengguna wajib membuka dan menyetujui Kebijakan Privasi aplikasi.',
      icon: 'PP',
      points: [],
    },
  ];

  constructor(
    private router: Router,
    private offlineSync: OfflineSyncService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.redirectIfWelcomeDone();
  }

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.redirectIfWelcomeDone();
  }

  get isFirstSlide(): boolean {
    return this.activeSlide === 0;
  }

  get isLastSlide(): boolean {
    return this.activeSlide === this.slides.length - 1;
  }

  get currentSlide(): WelcomeSlide {
    return this.slides[this.activeSlide];
  }

  get canAcceptPrivacy(): boolean {
    return this.isLastSlide && this.privacyOpened;
  }

  get canStartApp(): boolean {
    return this.isLastSlide && this.privacyOpened && this.privacyAccepted;
  }

  nextSlide(): void {
    if (!this.isLastSlide) {
      this.activeSlide += 1;
      return;
    }

    this.startApp();
  }

  previousSlide(): void {
    if (!this.isFirstSlide) {
      this.activeSlide -= 1;
    }
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
  }

  skipToPrivacy(): void {
    this.activeSlide = this.slides.length - 1;
  }

  openPrivacyPolicy(): void {
    this.privacyOpened = true;

    window.open(
      this.privacyPolicyUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  startApp(): void {
    if (!this.canStartApp) {
      return;
    }

    this.markWelcomeDone();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  resetWelcomeForTesting(): void {
    localStorage.removeItem(this.welcomeKey);
    localStorage.removeItem(this.privacyAcceptedKey);
    this.activeSlide = 0;
    this.privacyAccepted = false;
    this.privacyOpened = false;
  }

  private redirectIfWelcomeDone(): void {
    if (!this.hasCompletedWelcome() && !this.auth.isLoggedIn()) {
      return;
    }

    this.markWelcomeDone();
    this.router.navigateByUrl(this.getDefaultRoute(), { replaceUrl: true });
  }

  private hasCompletedWelcome(): boolean {
    return (
      localStorage.getItem(this.welcomeKey) === 'true' ||
      localStorage.getItem(this.privacyAcceptedKey) === 'true'
    );
  }

  private markWelcomeDone(): void {
    localStorage.setItem(this.welcomeKey, 'true');
    localStorage.setItem(this.privacyAcceptedKey, 'true');
  }

  private getDefaultRoute(): string {
    const role = this.auth.getRole();

    if (role === 'manager') {
      return '/app/manager/dashboard';
    }

    if (role === 'employee') {
      return '/app/employee/dashboard';
    }

    return '/login';
  }
}
