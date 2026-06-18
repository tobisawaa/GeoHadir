import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { OfflineSyncService } from '../../services/offline-sync.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  emailFocused = false;
  passwordFocused = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private offlineSync: OfflineSyncService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.navigateByRole();
    }
  }

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
  }

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      const toast = await this.toastCtrl.create({
        message: 'Email dan password wajib diisi dengan benar.',
        duration: 2200,
        color: 'warning',
        position: 'top',
      });

      await toast.present();
      return;
    }

    this.isLoading = true;

    const loading = await this.loadingCtrl.create({
      message: 'Memverifikasi akun...',
      spinner: 'circular',
    });

    await loading.present();

    this.auth.login(this.loginForm.value).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        this.navigateByRole();
      },
      error: async (err) => {
        await loading.dismiss();
        this.isLoading = false;

        const msg =
          err?.error?.message ||
          'Email atau password salah. Silakan coba lagi.';

        const toast = await this.toastCtrl.create({
          message: msg,
          duration: 3000,
          color: 'danger',
          position: 'top',
        });

        await toast.present();
      },
    });
  }

  private navigateByRole(): void {
    const role = this.auth.getRole();

    switch (role) {
      case 'employee':
        this.router.navigateByUrl('/app/employee/dashboard', { replaceUrl: true });
        break;

      case 'manager':
        this.router.navigateByUrl('/app/manager/dashboard', { replaceUrl: true });
        break;

      default:
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
        break;
    }
  }
}
