import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

type HistoryFilter = 'all' | 'attendance' | 'requests' | 'payroll';

interface HistoryItem {
  type: 'Presensi' | 'Cuti' | 'Lembur' | 'Gaji';
  title: string;
  date: string;
  description: string;
  status: 'Hadir' | 'Disetujui' | 'Menunggu' | 'Dibayar';
  category: HistoryFilter;
}

@Component({
  selector: 'app-history-hub',
  templateUrl: './history-hub.page.html',
  styleUrls: ['./history-hub.page.scss'],
  standalone: false,
})
export class HistoryHubPage implements OnInit {
  activeFilter: HistoryFilter = 'all';

  filters: Array<{ label: string; value: HistoryFilter }> = [
    { label: 'Semua', value: 'all' },
    { label: 'Presensi', value: 'attendance' },
    { label: 'Pengajuan', value: 'requests' },
    { label: 'Gaji', value: 'payroll' },
  ];

  histories: HistoryItem[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private offlineSync: OfflineSyncService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadHistories();
  }

  get filteredHistories(): HistoryItem[] {
    if (this.activeFilter === 'all') {
      return this.histories;
    }

    return this.histories.filter((item) => item.category === this.activeFilter);
  }

  setFilter(filter: HistoryFilter): void {
    this.activeFilter = filter;
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: HistoryItem['status']): string {
    if (status === 'Disetujui' || status === 'Hadir' || status === 'Dibayar') {
      return 'approved';
    }

    return 'pending';
  }

  private loadHistories(): void {
    forkJoin({
      attendance: this.api.get<any>('attendance/history').pipe(catchError(() => of({ data: [] }))),
      leaves: this.api.get<any>('leaves/history').pipe(catchError(() => of({ data: [] }))),
      overtimes: this.api.get<any>('overtimes/history').pipe(catchError(() => of({ data: [] }))),
      payrolls: this.api.get<any>('payroll/slips').pipe(catchError(() => of({ data: [] }))),
    }).subscribe((response) => {
      this.histories = [
        ...this.extractList(response.attendance).map((item: any) => this.mapAttendance(item)),
        ...this.extractList(response.leaves).map((item: any) => this.mapLeave(item)),
        ...this.extractList(response.overtimes).map((item: any) => this.mapOvertime(item)),
        ...this.extractList(response.payrolls).map((item: any) => this.mapPayroll(item)),
      ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    });
  }

  private mapAttendance(item: any): HistoryItem {
    return {
      type: 'Presensi',
      title: 'Presensi',
      date: item?.date ?? item?.created_at ?? '',
      description: `${this.formatTime(item?.check_in)} - ${this.formatTime(item?.check_out)}`,
      status: 'Hadir',
      category: 'attendance',
    };
  }

  private mapLeave(item: any): HistoryItem {
    return {
      type: 'Cuti',
      title: 'Pengajuan cuti',
      date: item?.created_at ?? item?.start_date ?? '',
      description: `${this.formatDate(item?.start_date)} - ${this.formatDate(item?.end_date)}`,
      status: this.normalizeRequestStatus(item?.status),
      category: 'requests',
    };
  }

  private mapOvertime(item: any): HistoryItem {
    return {
      type: 'Lembur',
      title: 'Pengajuan lembur',
      date: item?.date ?? item?.created_at ?? '',
      description: `${this.formatDate(item?.date)} · ${item?.duration_hours ?? 0} jam`,
      status: this.normalizeRequestStatus(item?.status),
      category: 'requests',
    };
  }

  private mapPayroll(item: any): HistoryItem {
    return {
      type: 'Gaji',
      title: `Slip gaji ${this.formatPeriod(item?.period)}`,
      date: item?.period ? `${item.period}-01` : item?.created_at ?? '',
      description: `Total diterima ${this.formatCurrency(item?.net_salary ?? 0)}`,
      status: 'Dibayar',
      category: 'payroll',
    };
  }

  private normalizeRequestStatus(status: string): 'Disetujui' | 'Menunggu' {
    return String(status || '').toLowerCase() === 'approved' ? 'Disetujui' : 'Menunggu';
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

  private formatTime(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  private formatPeriod(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(`${value}-01`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  private formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }
}
