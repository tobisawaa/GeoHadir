import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Payslip, PayrollHistory, ApiResponse } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  constructor(private api: ApiService) {}

  getLatestPayslip(): Observable<ApiResponse<Payslip[]>> {
    return this.api.get<ApiResponse<Payslip[]>>('payroll/slips');
  }

  getPayslipByPeriod(period: string): Observable<ApiResponse<Payslip[]>> {
    return this.api.get<ApiResponse<Payslip[]>>('payroll/slips');
  }

  getHistory(): Observable<ApiResponse<PayrollHistory[]>> {
    return this.api.get<ApiResponse<PayrollHistory[]>>('payroll/slips');
  }

  getPayslipById(id: number): Observable<ApiResponse<Payslip>> {
    return this.api.get<ApiResponse<Payslip>>(`payroll/slips/${id}`);
  }
}
