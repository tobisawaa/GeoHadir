import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineSyncService } from '../../../services/offline-sync.service';
import { PayrollService } from '../../../services/payroll.service';

interface PayrollHistory {
  month: string;
  total: string;
  status: string;
}

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.page.html',
  styleUrls: ['./payslip.page.scss'],
  standalone: false,
})
export class PayslipPage implements OnInit {
  period = '-';
  netSalary = 'Rp 0';

  earnings: Array<{ label: string; value: string }> = [];

  deductions: Array<{ label: string; value: string }> = [];

  histories: PayrollHistory[] = [];

  constructor(
    private router: Router,
    private offlineSync: OfflineSyncService,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
    this.loadPayroll();
  }

  goTo(route: string): void { this.router.navigateByUrl(route); }

  private loadPayroll(): void {
    this.payrollService.getHistory().subscribe({
      next: (response: any) => {
        const data = response?.data !== undefined ? response.data : response;
        const slips = Array.isArray(data) ? data : data?.items ?? data?.payrolls ?? [];
        const latest = slips[0];

        this.histories = slips.slice(1).map((item: any) => ({
          month: this.formatPeriod(item?.period),
          total: this.formatCurrency(item?.net_salary ?? item?.total_earnings ?? 0),
          status: this.formatStatus(item?.status),
        }));

        if (!latest) {
          this.period = '-';
          this.netSalary = 'Rp 0';
          this.earnings = [];
          this.deductions = [];
          return;
        }

        const basicSalary = Number(latest?.basic_salary ?? latest?.base_salary ?? 0);
        const overtimePay = Number(latest?.overtime_pay ?? 0);
        const deductions = Number(latest?.deductions ?? 0);

        this.period = this.formatPeriod(latest.period);
        this.netSalary = this.formatCurrency(latest?.net_salary ?? 0);
        this.earnings = [
          { label: 'Gaji Pokok', value: this.formatCurrency(basicSalary) },
          { label: 'Lembur', value: this.formatCurrency(overtimePay) },
        ];
        this.deductions = [
          { label: 'Potongan', value: `- ${this.formatCurrency(deductions)}` },
        ];
      },
      error: () => {
        this.period = '-';
        this.netSalary = 'Rp 0';
        this.earnings = [];
        this.deductions = [];
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

  private formatStatus(status: string): string {
    const value = String(status || '').toLowerCase();

    if (value === 'paid') {
      return 'Dibayar';
    }

    if (value === 'pending') {
      return 'Menunggu';
    }

    return 'Tersedia';
  }

  private formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }
}
