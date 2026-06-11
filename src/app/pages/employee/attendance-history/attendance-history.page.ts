import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../../services/offline-sync.service';

type HistoryType = 'Semua' | 'Absensi' | 'Cuti' | 'Lembur' | 'Payroll';

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
  filters: HistoryType[] = ['Semua', 'Absensi', 'Cuti', 'Lembur', 'Payroll'];

  histories: HistoryItem[] = [
    { id: 1, type: 'Absensi', title: 'Check-in Kantor Pusat', description: '08:42 AM · Lokasi valid', date: '24 Okt 2026', status: 'Tepat Waktu' },
    { id: 2, type: 'Cuti', title: 'Cuti Tahunan', description: '15 Jun 2026 - 17 Jun 2026', date: '22 Mei 2026', status: 'Menunggu' },
    { id: 3, type: 'Lembur', title: 'Deployment aplikasi', description: '18 Mei 2026 · 2.5 jam', date: '18 Mei 2026', status: 'Disetujui' },
    { id: 4, type: 'Payroll', title: 'Slip Gaji Oktober', description: 'Total diterima Rp 12.450.000', date: '25 Okt 2026', status: 'Tersedia' },
    { id: 5, type: 'Cuti', title: 'Sakit', description: '10 Mei 2026 - 11 Mei 2026', date: '10 Mei 2026', status: 'Disetujui' },
  ];

  constructor(
    private router: Router,
    private offlineSync: OfflineSyncService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
  }

  get filteredHistories(): HistoryItem[] {
    if (this.selectedFilter === 'Semua') return this.histories;
    return this.histories.filter((item) => item.type === this.selectedFilter);
  }

  setFilter(filter: HistoryType): void {
    this.selectedFilter = filter;
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: string): string {
    if (status === 'Disetujui' || status === 'Tepat Waktu' || status === 'Tersedia') return 'success';
    if (status === 'Ditolak' || status === 'Terlambat') return 'danger';
    return '';
  }
}
