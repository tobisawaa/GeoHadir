import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeaveService } from '../../../services/leave.service';
import { OfflineSyncService } from '../../../services/offline-sync.service';

type HistoryType = 'Semua' | 'Cuti';

interface HistoryItem {
  id: number;
  type: 'Cuti';
  title: string;
  description: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
}

@Component({
  selector: 'app-leave-history',
  templateUrl: './leave-history.page.html',
  styleUrls: ['./leave-history.page.scss'],
  standalone: false,
})
export class LeaveHistoryPage implements OnInit {
  selectedFilter: HistoryType = 'Cuti';
  filters: HistoryType[] = ['Semua', 'Cuti'];
  histories: HistoryItem[] = [];

  constructor(
    private router: Router,
    private leaveService: LeaveService,
    private offlineSync: OfflineSyncService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadLeaveHistory();
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

  private loadLeaveHistory(): void {
    this.leaveService.getMyLeaves().subscribe({
      next: (response: any) => {
        const data = response?.data !== undefined ? response.data : response;
        const list = Array.isArray(data) ? data : data?.items ?? data?.leaves ?? [];

        this.histories = list.map((item: any) => ({
          id: item?.id,
          type: 'Cuti',
          title: 'Pengajuan cuti',
          description: `${this.formatDate(item?.start_date)} - ${this.formatDate(item?.end_date)}`,
          date: this.formatDate(item?.created_at ?? item?.start_date),
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
