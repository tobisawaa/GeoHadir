import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false,
})
export class ReportsPage implements OnInit {
  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  generating = false;
  generatingReport: string | null = null;
  loading = true;

  months = [
    { value: 0, label: 'Januari' }, { value: 1, label: 'Februari' },
    { value: 2, label: 'Maret' }, { value: 3, label: 'April' },
    { value: 4, label: 'Mei' }, { value: 5, label: 'Juni' },
    { value: 6, label: 'Juli' }, { value: 7, label: 'Agustus' },
    { value: 8, label: 'September' }, { value: 9, label: 'Oktober' },
    { value: 10, label: 'November' }, { value: 11, label: 'Desember' },
  ];

  years: number[] = [];

  reportTypes: ReportType[] = [
    {
      id: 'absensi',
      title: 'Laporan Absensi',
      description: 'Rekap kehadiran, keterlambatan, dan ketidakhadiran karyawan per periode.',
      icon: 'calendar-check-outline',
      color: '#2563eb',
    },
    {
      id: 'cuti',
      title: 'Laporan Cuti',
      description: 'Rekap pengajuan cuti karyawan termasuk status persetujuan.',
      icon: 'calendar-outline',
      color: '#8b5cf6',
    },
    {
      id: 'lembur',
      title: 'Laporan Lembur',
      description: 'Rekap jam lembur dan biaya lembur karyawan per periode.',
      icon: 'moon-outline',
      color: '#f59e0b',
    },
    {
      id: 'payroll',
      title: 'Laporan Payroll',
      description: 'Ringkasan penggajian, tunjangan, potongan, dan take home pay.',
      icon: 'wallet-outline',
      color: '#22c55e',
    },
  ];

  constructor(
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  get period(): string {
    return `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}`;
  }

  generateReport(report: ReportType) {
    this.generating = true;
    this.generatingReport = report.id;

    setTimeout(() => {
      this.generating = false;
      this.generatingReport = null;
      this.showToast(`Laporan ${report.title} berhasil dihasilkan`, 'success');
    }, 2000);
  }

  getReportIcon(id: string): string {
    const map: Record<string, string> = {
      absensi: 'calendar_check',
      cuti: 'calendar_month',
      lembur: 'dark_mode',
      payroll: 'payments',
    };
    return map[id] || 'description';
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
