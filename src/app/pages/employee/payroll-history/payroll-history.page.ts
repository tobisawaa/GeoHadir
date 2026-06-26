import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { PayrollService } from '../../../services/payroll.service';

type HistoryType = 'Semua' | 'Presensi' | 'Cuti' | 'Lembur' | 'Gaji';

interface HistoryItem {
  id: number;
  type: Exclude<HistoryType, 'Semua'>;
  title: string;
  description: string;
  date: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak' | 'Tepat Waktu' | 'Terlambat' | 'Tersedia';
}

@Component({
  selector: 'app-payroll-history',
  templateUrl: './payroll-history.page.html',
  styleUrls: ['./payroll-history.page.scss'],
  standalone: false,
})
export class PayrollHistoryPage implements OnInit {
  selectedFilter: HistoryType = 'Gaji';
  filters: HistoryType[] = ['Semua', 'Presensi', 'Cuti', 'Lembur', 'Gaji'];
  histories: HistoryItem[] = [];

  constructor(
    private router: Router,
    private offlineSync: OfflineSyncService,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadPayrollHistory();
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

  private loadPayrollHistory(): void {
    this.payrollService.getHistory().subscribe({
      next: (response: any) => {
        const data = response?.data !== undefined ? response.data : response;
        const slips = Array.isArray(data) ? data : data?.items ?? data?.payrolls ?? [];

        this.histories = slips.map((item: any) => ({
          id: item?.id,
          type: 'Gaji',
          title: `Slip Gaji ${this.formatPeriod(item?.period)}`,
          description: `Total diterima ${this.formatCurrency(item?.net_salary ?? 0)}`,
          date: this.formatPeriod(item?.period),
          status: this.formatStatus(item?.status),
        }));
      },
      error: () => {
        this.histories = [];
      },
    });
  }

  private formatPeriod(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(`${value}-01`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  private formatStatus(status: string): HistoryItem['status'] {
    return String(status || '').toLowerCase() === 'cancelled' ? 'Ditolak' : 'Tersedia';
  }

  private formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }
}
