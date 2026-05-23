import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { TeamMember } from '../../../interfaces/models';

@Component({
  selector: 'app-team',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
  standalone: false,
})
export class TeamPage implements OnInit {
  members: TeamMember[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.error = false;

    this.userService.getTeamMembers().subscribe({
      next: (res) => {
        this.members = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data tim';
      },
    });
  }

  async doRefresh(event: any) {
    this.userService.getTeamMembers().subscribe({
      next: (res) => {
        this.members = res.data;
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  async showMemberDetail(member: TeamMember) {
    const statusMap: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Absen',
    };
    const statusColorMap: Record<string, string> = {
      present: 'success',
      late: 'warning',
      absent: 'danger',
    };
    const status = member.attendance_today ? statusMap[member.attendance_today] : 'Belum tercatat';
    const statusColor = member.attendance_today ? statusColorMap[member.attendance_today] : 'medium';

    const alert = await this.alertCtrl.create({
      header: member.name,
      subHeader: member.position,
      message: `
        <strong>Departemen:</strong> ${member.department}<br>
        <strong>Email:</strong> ${member.email}<br>
        <strong>Telepon:</strong> ${member.phone || '-'}<br>
        <strong>Status Hari Ini:</strong> <ion-badge color="${statusColor}">${status}</ion-badge>
      `,
      buttons: ['Tutup'],
    });
    await alert.present();
  }

  attendanceIcon(status: string | null | undefined): string {
    switch (status) {
      case 'present': return 'checkmark-circle';
      case 'late': return 'time';
      case 'absent': return 'close-circle';
      default: return 'remove-circle-outline';
    }
  }

  attendanceColor(status: string | null | undefined): string {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'danger';
      default: return 'medium';
    }
  }

  attendanceIconName(status: string | null | undefined): string {
    switch (status) {
      case 'present': return 'check_circle';
      case 'late': return 'schedule';
      case 'absent': return 'cancel';
      default: return 'remove_circle_outline';
    }
  }

  attendanceIconColor(status: string | null | undefined): string {
    switch (status) {
      case 'present': return 'var(--ion-color-success)';
      case 'late': return 'var(--ion-color-warning)';
      case 'absent': return 'var(--ion-color-danger)';
      default: return 'var(--on-surface-variant)';
    }
  }

  goBack() {
    this.router.navigate(['/app/employee/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
