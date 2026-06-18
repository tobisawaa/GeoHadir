import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { OvertimeRequest, ApiResponse } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class OvertimeService {
  constructor(private api: ApiService) {}

  submit(data: Partial<OvertimeRequest>): Observable<ApiResponse<OvertimeRequest>> {
    return this.api.post<ApiResponse<OvertimeRequest>>('overtimes/apply', data);
  }

  getMyOvertimes(params?: { page?: number; per_page?: number }): Observable<ApiResponse<OvertimeRequest[]>> {
    return this.api.get<ApiResponse<OvertimeRequest[]>>('overtimes/history', params as any);
  }

  getById(id: number): Observable<ApiResponse<OvertimeRequest>> {
    return this.api.get<ApiResponse<OvertimeRequest>>(`overtimes/${id}`);
  }

  cancel(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`overtimes/${id}`);
  }

  getTeamOvertimes(params?: { status?: string }): Observable<ApiResponse<OvertimeRequest[]>> {
    return this.api.get<ApiResponse<OvertimeRequest[]>>('manager/approvals/overtimes', params as any);
  }

  approve(id: number, notes?: string): Observable<ApiResponse<OvertimeRequest>> {
    return this.api.post<ApiResponse<OvertimeRequest>>(`manager/approvals/overtimes/${id}/action`, {
      status: 'approved',
      notes,
    });
  }

  reject(id: number, notes?: string): Observable<ApiResponse<OvertimeRequest>> {
    return this.api.post<ApiResponse<OvertimeRequest>>(`manager/approvals/overtimes/${id}/action`, {
      status: 'rejected',
      notes,
    });
  }
}
