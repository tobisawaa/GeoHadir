import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import { OfflineSyncService } from '../../../services/offline-sync.service';

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

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
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

    this.http.get<any>(`${this.apiUrl}/manager/team`).subscribe({
      next: (response) => {
        const data = this.extractData(response);
        const list = Array.isArray(data) ? data : data?.members ?? data?.team ?? [];

        this.teamMembers = list.length
          ? list.map((item: any) => this.mapTeamMember(item))
          : this.getFallbackMembers();

        this.isLoading = false;
      },
      error: async () => {
        this.teamMembers = this.getFallbackMembers();
        this.isLoading = false;

        const toast = await this.toastCtrl.create({
          message: 'Backend belum merespons. Data tim demo ditampilkan.',
          duration: 2200,
          color: 'warning',
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
      id: Number(item?.id ?? item?.employee_id ?? Date.now()),
      name: item?.name ?? item?.employee_name ?? 'Employee',
      position: item?.position ?? item?.job_title ?? 'Staff',
      department: item?.department ?? item?.department_name ?? 'General',
      email: item?.email ?? '-',
      phone: item?.phone ?? item?.phone_number ?? '-',
      attendanceStatus: this.normalizeStatus(item?.attendance_status ?? item?.status ?? 'Belum Absen'),
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

  private getFallbackMembers(): TeamMember[] {
    return [
      {
        id: 1,
        name: 'Budi Santoso',
        position: 'Frontend Developer',
        department: 'Information Technology',
        email: 'budi@geohadir.com',
        phone: '0812-1000-2001',
        attendanceStatus: 'Hadir',
      },
      {
        id: 2,
        name: 'Siti Aminah',
        position: 'UI/UX Designer',
        department: 'Product Design',
        email: 'siti@geohadir.com',
        phone: '0812-1000-2002',
        attendanceStatus: 'Terlambat',
      },
      {
        id: 3,
        name: 'Andi Pratama',
        position: 'Backend Developer',
        department: 'Information Technology',
        email: 'andi@geohadir.com',
        phone: '0812-1000-2003',
        attendanceStatus: 'Cuti',
      },
      {
        id: 4,
        name: 'Dewi Lestari',
        position: 'QA Engineer',
        department: 'Quality Assurance',
        email: 'dewi@geohadir.com',
        phone: '0812-1000-2004',
        attendanceStatus: 'Belum Absen',
      },
    ];
  }
}
