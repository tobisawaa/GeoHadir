import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { PayrollService } from '../../../services/payroll.service';
import { PayrollHistory } from '../../../interfaces/models';

interface PayrollEmployee {
  id: number;
  name: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'paid' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-payroll-management',
  templateUrl: './payroll-management.page.html',
  styleUrls: ['./payroll-management.page.scss'],
  standalone: false,
})
export class PayrollManagementPage implements OnInit {
  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  employees: PayrollEmployee[] = [];
  filteredEmployees: PayrollEmployee[] = [];
  statusFilter: 'all' | 'paid' | 'pending' | 'cancelled' = 'all';
  loading = true;
  error = false;
  errorMessage = '';

  months = [
    { value: 0, label: 'Januari' }, { value: 1, label: 'Februari' },
    { value: 2, label: 'Maret' }, { value: 3, label: 'April' },
    { value: 4, label: 'Mei' }, { value: 5, label: 'Juni' },
    { value: 6, label: 'Juli' }, { value: 7, label: 'Agustus' },
    { value: 8, label: 'September' }, { value: 9, label: 'Oktober' },
    { value: 10, label: 'November' }, { value: 11, label: 'Desember' },
  ];

  years: number[] = [];

  constructor(
    private payrollService: PayrollService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    const y = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => y - 2 + i);
  }

  ngOnInit() {
    this.loadPayroll();
  }

  get period(): string {
    return `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}`;
  }

  get totalPayroll(): number {
    return this.filteredEmployees.reduce((sum, e) => sum + e.net_salary, 0);
  }

  loadPayroll() {
    this.loading = true;
    this.error = false;

    this.payrollService.getHistory().subscribe({
      next: (res) => {
        const data = res.data;
        this.employees = this.mockPayrollData();
        this.applyStatusFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Gagal memuat data payroll';
      },
    });
  }

  private mockPayrollData(): PayrollEmployee[] {
    return [
      { id: 1, name: 'Budi Santoso', base_salary: 8500000, allowances: 1500000, deductions: 500000, net_salary: 9500000, status: 'paid' },
      { id: 2, name: 'Siti Rahmawati', base_salary: 7500000, allowances: 1000000, deductions: 400000, net_salary: 8100000, status: 'paid' },
      { id: 3, name: 'Ahmad Fauzi', base_salary: 9200000, allowances: 2000000, deductions: 750000, net_salary: 10450000, status: 'pending' },
      { id: 4, name: 'Dewi Lestari', base_salary: 6800000, allowances: 800000, deductions: 350000, net_salary: 7250000, status: 'paid' },
      { id: 5, name: 'Rudi Hermawan', base_salary: 5500000, allowances: 500000, deductions: 250000, net_salary: 5750000, status: 'cancelled' },
      { id: 6, name: 'Fitri Handayani', base_salary: 11000000, allowances: 2500000, deductions: 1000000, net_salary: 12500000, status: 'pending' },
    ];
  }

  onPeriodChange() {
    this.loadPayroll();
  }

  setStatusFilter(filter: 'all' | 'paid' | 'pending' | 'cancelled') {
    this.statusFilter = filter;
    this.applyStatusFilter();
  }

  private applyStatusFilter() {
    if (this.statusFilter === 'all') {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter((e) => e.status === this.statusFilter);
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Dibayar';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}
