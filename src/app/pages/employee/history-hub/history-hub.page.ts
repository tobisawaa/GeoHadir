import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../../services/offline-sync.service';

type HistoryFilter = 'all' | 'attendance' | 'requests' | 'payroll';

interface HistoryItem {
  type: 'Attendance' | 'Cuti' | 'Lembur' | 'Payroll';
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
    { label: 'Absensi', value: 'attendance' },
    { label: 'Request', value: 'requests' },
    { label: 'Payroll', value: 'payroll' },
  ];

  histories: HistoryItem[] = [
    {
      type: 'Attendance',
      title: 'Check-in Kantor Pusat',
      date: '08 Jun 2026 · 08:02 - 17:05',
      description: 'Lokasi absensi berhasil tervalidasi.',
      status: 'Hadir',
      category: 'attendance',
    },
    {
      type: 'Cuti',
      title: 'Cuti Tahunan',
      date: '15 Jun 2026 - 17 Jun 2026',
      description: 'Menunggu approval dari manager.',
      status: 'Menunggu',
      category: 'requests',
    },
    {
      type: 'Lembur',
      title: 'Lembur Deployment',
      date: '18 Mei 2026 · 18:00 - 20:30',
      description: 'Pengajuan lembur telah disetujui.',
      status: 'Disetujui',
      category: 'requests',
    },
    {
      type: 'Payroll',
      title: 'Slip Gaji Mei 2026',
      date: '25 Mei 2026',
      description: 'Slip gaji sudah tersedia untuk dilihat.',
      status: 'Dibayar',
      category: 'payroll',
    },
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
}
