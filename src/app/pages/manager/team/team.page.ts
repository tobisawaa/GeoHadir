import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { UserService } from '../../../services/user.service';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  attendanceStatus: 'Hadir' | 'Terlambat' | 'Cuti' | 'Belum Absen' | string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
  standalone: false,
})
export class TeamPage implements OnInit {
  isLoading = false;
  searchKeyword = '';

  teamMembers: TeamMember[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private offlineSync: OfflineSyncService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadTeamMembers();
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  loadTeamMembers(): void {
    this.isLoading = true;

    this.userService.getManagerTeam().subscribe({
      next: (response) => {
        const data = this.extractData(response);
        const list = Array.isArray(data) ? data : [];

        this.teamMembers = list.map((item: any) => this.mapTeamMember(item));
        this.isLoading = false;
      },
      error: async (error) => {
        this.teamMembers = [];
        this.isLoading = false;

        const toast = await this.toastCtrl.create({
          message: error?.error?.message || 'Gagal memuat anggota tim dari server.',
          duration: 2200,
          color: 'danger',
          position: 'top',
        });

        await toast.present();
      },
    });
  }

  get filteredMembers(): TeamMember[] {
    const keyword = this.searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return this.teamMembers;
    }

    return this.teamMembers.filter((member) => {
      return (
        member.name.toLowerCase().includes(keyword) ||
        member.position.toLowerCase().includes(keyword) ||
        member.department.toLowerCase().includes(keyword)
      );
    });
  }

  get activeMembers(): number {
    return this.teamMembers.length;
  }

  get presentMembers(): number {
    return this.teamMembers.filter((member) => member.attendanceStatus === 'Hadir').length;
  }

  get pendingAttendanceMembers(): number {
    return this.teamMembers.filter((member) => member.attendanceStatus === 'Belum Absen').length;
  }

  getStatusClass(status: string): string {
    const value = status.toLowerCase();

    if (value.includes('hadir')) {
      return 'present';
    }

    if (value.includes('terlambat')) {
      return 'late';
    }

    if (value.includes('cuti')) {
      return 'leave';
    }

    return 'empty';
  }

  trackByMember(index: number, member: TeamMember): number | string {
    return member.id ?? `${member.email}-${index}`;
  }

  private extractData(response: any): any {
    if (response?.data !== undefined) {
      return response.data;
    }

    return response;
  }

  private mapTeamMember(item: any): TeamMember {
    return {
      id: Number(item?.id ?? item?.employee_id ?? item?.user_id ?? 0),
      name: item?.name ?? item?.employee_name ?? 'Karyawan',
      position: item?.position ?? item?.job_title ?? 'Karyawan',
      department: item?.department ?? item?.department_name ?? 'Umum',
      email: item?.email ?? '-',
      phone: item?.phone ?? item?.phone_number ?? '-',
      attendanceStatus: this.normalizeStatus(item?.attendance_status ?? item?.attendance_today?.status ?? item?.status ?? 'absent'),
    };
  }

  private normalizeStatus(status: string): string {
    const value = String(status || '').toLowerCase();

    if (value === 'present' || value === 'hadir' || value === 'ontime') {
      return 'Hadir';
    }

    if (value === 'late' || value === 'terlambat') {
      return 'Terlambat';
    }

    if (value === 'leave' || value === 'cuti' || value === 'sakit') {
      return 'Cuti';
    }

    return 'Belum Absen';
  }
}
