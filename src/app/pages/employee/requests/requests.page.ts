import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../../services/offline-sync.service';

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
      description: 'Ajukan cuti tahunan, sakit, atau izin dan pantau status approval.',
      route: '/app/employee/leave',
      icon: 'leave',
      meta: '8 hari tersisa',
    },
    {
      title: 'Pengajuan Lembur',
      description: 'Ajukan lembur dengan tanggal, durasi, dan alasan pekerjaan.',
      route: '/app/employee/overtime',
      icon: 'overtime',
      meta: '2 request aktif',
    },
  ];

  recentRequests: RequestHistoryItem[] = [
    {
      title: 'Cuti Tahunan',
      date: '15 Jun 2026 - 17 Jun 2026',
      status: 'Menunggu',
      type: 'Cuti',
    },
    {
      title: 'Lembur Deployment',
      date: '18 Mei 2026 · 18:00 - 20:30',
      status: 'Disetujui',
      type: 'Lembur',
    },
    {
      title: 'Sakit',
      date: '10 Mei 2026 - 11 Mei 2026',
      status: 'Disetujui',
      type: 'Cuti',
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

  goTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  getStatusClass(status: RequestHistoryItem['status']): string {
    if (status === 'Disetujui') return 'approved';
    if (status === 'Ditolak') return 'rejected';
    return 'pending';
  }
}
