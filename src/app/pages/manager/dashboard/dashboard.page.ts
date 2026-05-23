import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
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

    this.userService.getManagerDashboard().subscribe({
      next: (res) => {
        this.dashboard = res.data;
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
        this.dashboard = res.data;
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}
