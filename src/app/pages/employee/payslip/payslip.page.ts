import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  period = 'Oktober 2026';
  netSalary = 'Rp 12.450.000';

  earnings = [
    { label: 'Gaji Pokok', value: 'Rp 10.000.000' },
    { label: 'Tunjangan Jabatan', value: 'Rp 2.000.000' },
    { label: 'Lembur', value: 'Rp 900.000' },
  ];

  deductions = [
    { label: 'PPH 21', value: '- Rp 350.000' },
    { label: 'BPJS Ketenagakerjaan', value: '- Rp 100.000' },
  ];

  histories: PayrollHistory[] = [
    { month: 'September 2026', total: 'Rp 11.900.000', status: 'Tersedia' },
    { month: 'Agustus 2026', total: 'Rp 12.100.000', status: 'Tersedia' },
    { month: 'Juli 2026', total: 'Rp 10.000.000', status: 'Tersedia' },
  ];

  constructor(private router: Router) {}
  ngOnInit(): void {}
  goTo(route: string): void { this.router.navigateByUrl(route); }
}
