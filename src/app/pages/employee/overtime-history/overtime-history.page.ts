import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { OvertimeService } from '../../../services/overtime.service';

type HistoryType = 'Semua' | 'Lembur';

interface HistoryItem {
  id: number;
  type: 'Lembur';
  title: string;
  description: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
}

@Component({
  selector: 'app-overtime-history',
  templateUrl: './overtime-history.page.html',
  styleUrls: ['./overtime-history.page.scss'],
  standalone: false,
})
export class OvertimeHistoryPage implements OnInit {
  selectedFilter: HistoryType = 'Lembur';
  filters: HistoryType[] = ['Semua', 'Lembur'];
  histories: HistoryItem[] = [];

  constructor(
    private router: Router,
    private offlineSync: OfflineSyncService,
    private overtimeService: OvertimeService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadOvertimeHistory();
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
    if (status === 'Disetujui') {
      return 'success';
    }

    if (status === 'Ditolak') {
      return 'danger';
    }

    return '';
  }

  private loadOvertimeHistory(): void {
    this.overtimeService.getMyOvertimes().subscribe({
      next: (response: any) => {
        const data = response?.data !== undefined ? response.data : response;
        const list = Array.isArray(data) ? data : data?.items ?? data?.overtimes ?? [];

        this.histories = list.map((item: any) => ({
          id: item?.id,
          type: 'Lembur',
          title: 'Pengajuan lembur',
          description: `${this.formatDate(item?.date)} · ${item?.duration_hours ?? 0} jam`,
          date: this.formatDate(item?.created_at ?? item?.date),
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

    if (value === 'approved') {
      return 'Disetujui';
    }

    if (value === 'rejected') {
      return 'Ditolak';
    }

    return 'Menunggu';
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
