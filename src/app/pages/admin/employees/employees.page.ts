import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { TeamMember } from '../../../interfaces/models';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
  standalone: false,
})
export class EmployeesPage implements OnInit {
  employees: TeamMember[] = [];
  filteredEmployees: TeamMember[] = [];
  searchQuery = '';
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
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.error = false;

    this.userService.getTeamMembers().subscribe({
      next: (res) => {
        this.employees = res.data;
        this.filteredEmployees = [...this.employees];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data karyawan';
      },
    });
  }

  doRefresh(event: any) {
    this.userService.getTeamMembers().subscribe({
      next: (res) => {
        this.employees = res.data;
        this.filteredEmployees = [...this.employees];
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.showToast('Gagal memperbarui data', 'danger');
      },
    });
  }

  searchEmployees() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    this.filteredEmployees = this.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    );
  }

  async showEmployeeDetail(emp: TeamMember) {
    const alert = await this.alertCtrl.create({
      header: emp.name,
      subHeader: `${emp.position} - ${emp.department}`,
      message: `Email: ${emp.email}\nTelepon: ${emp.phone || '-'}`,
      buttons: ['Tutup'],
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
