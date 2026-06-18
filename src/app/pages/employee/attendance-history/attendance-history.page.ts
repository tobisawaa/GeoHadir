import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

type HistoryType = 'Semua' | 'Absensi' | 'Cuti' | 'Lembur' | 'Gaji';

interface HistoryItem {
  id: number;
  type: Exclude<HistoryType, 'Semua'>;
  title: string;
  description: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak' | 'Tepat Waktu' | 'Terlambat' | 'Tersedia';
}

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.page.html',
  styleUrls: ['./attendance-history.page.scss'],
  standalone: false,
})
export class AttendanceHistoryPage implements OnInit {
  selectedFilter: HistoryType = 'Absensi';
  filters: HistoryType[] = ['Semua', 'Absensi'];
  histories: HistoryItem[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private offlineSync: OfflineSyncService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadAttendanceHistory();
  }

  get filteredHistories(): HistoryItem[] {
    if (this.selectedFilter === 'Semua') {
      return this.histories;
    }

    return this.histories.filter((item) => item.type === this.selectedFilter);
  }

  setFilter(filter: HistoryType): void {
    this.selectedFilter = filter;
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: string): string {
    if (status === 'Disetujui' || status === 'Tepat Waktu' || status === 'Tersedia') {
      return 'success';
    }

    if (status === 'Ditolak' || status === 'Terlambat') {
      return 'danger';
    }

    return '';
  }

  private loadAttendanceHistory(): void {
    this.api.get<any>('attendance/history').subscribe({
      next: (response) => {
        const data = response?.data !== undefined ? response.data : response;
        const list = Array.isArray(data) ? data : data?.items ?? data?.attendance ?? [];

        this.histories = list.map((item: any) => ({
          id: item?.id,
          type: 'Absensi',
          title: 'Absensi karyawan',
          description: `${this.formatTime(item?.check_in)} - ${this.formatTime(item?.check_out)}`,
          date: this.formatDate(item?.date ?? item?.created_at),
          status: this.normalizeStatus(item?.status),
        }));
      },
      error: () => {
        this.histories = [];
      },
    });
  }

  private normalizeStatus(status: string): HistoryItem['status'] {
    const value = String(status || '').toLowerCase();
    return value === 'late' ? 'Terlambat' : 'Tepat Waktu';
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
}
