import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LeaveService } from '../../../services/leave.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { OvertimeService } from '../../../services/overtime.service';

interface RequestShortcut {
  title: string;
  description: string;
  route: string;
  icon: 'leave' | 'overtime';
  meta: string;
}

interface RequestHistoryItem {
  title: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
  type: 'Cuti' | 'Lembur';
  createdAt: string;
}

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  standalone: false,
})
export class RequestsPage implements OnInit {
  shortcuts: RequestShortcut[] = [
    {
      title: 'Pengajuan Cuti',
      description: 'Ajukan cuti tahunan, sakit, atau izin dan pantau status persetujuan.',
      route: '/app/employee/leave',
      icon: 'leave',
      meta: '0 menunggu',
    },
    {
      title: 'Pengajuan Lembur',
      description: 'Ajukan lembur dengan tanggal, durasi, dan alasan pekerjaan.',
      route: '/app/employee/overtime',
      icon: 'overtime',
      meta: '0 menunggu',
    },
  ];

  recentRequests: RequestHistoryItem[] = [];

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private overtimeService: OvertimeService,
    private offlineSync: OfflineSyncService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadRequests();
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: RequestHistoryItem['status']): string {
    if (status === 'Disetujui') return 'approved';
    if (status === 'Ditolak') return 'rejected';
    return 'pending';
  }

  private loadRequests(): void {
    forkJoin({
      leaves: this.leaveService.getMyLeaves().pipe(catchError(() => of({ data: [] }))),
      overtimes: this.overtimeService.getMyOvertimes().pipe(catchError(() => of({ data: [] }))),
    }).subscribe((response: any) => {
      const leaves = this.extractList(response.leaves);
      const overtimes = this.extractList(response.overtimes);

      const leaveRequests = leaves.map((item: any) => this.mapLeave(item));
      const overtimeRequests = overtimes.map((item: any) => this.mapOvertime(item));

      this.recentRequests = [...leaveRequests, ...overtimeRequests]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 5);

      this.shortcuts = this.shortcuts.map((shortcut) => {
        const pendingCount = shortcut.icon === 'leave'
          ? leaveRequests.filter((item) => item.status === 'Menunggu').length
          : overtimeRequests.filter((item) => item.status === 'Menunggu').length;

        return {
          ...shortcut,
          meta: `${pendingCount} menunggu`,
        };
      });
    });
  }

  private mapLeave(item: any): RequestHistoryItem {
    return {
      title: 'Pengajuan cuti',
      date: `${this.formatDate(item?.start_date)} - ${this.formatDate(item?.end_date)}`,
      status: this.normalizeStatus(item?.status),
      type: 'Cuti',
      createdAt: item?.created_at ?? item?.start_date ?? '',
    };
  }

  private mapOvertime(item: any): RequestHistoryItem {
    return {
      title: 'Pengajuan lembur',
      date: `${this.formatDate(item?.date)} · ${item?.duration_hours ?? 0} jam`,
      status: this.normalizeStatus(item?.status),
      type: 'Lembur',
      createdAt: item?.created_at ?? item?.date ?? '',
    };
  }

  private normalizeStatus(status: string): RequestHistoryItem['status'] {
    const value = String(status || '').toLowerCase();

    if (value === 'approved') {
      return 'Disetujui';
    }

    if (value === 'rejected') {
      return 'Ditolak';
    }

    return 'Menunggu';
  }

  private extractList(response: any): any[] {
    const data = response?.data !== undefined ? response.data : response;
    return Array.isArray(data) ? data : data?.items ?? [];
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
