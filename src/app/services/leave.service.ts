import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveRequest, ApiResponse } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private api: ApiService) {}

  submit(data: Partial<LeaveRequest>): Observable<ApiResponse<LeaveRequest>> {
    return this.api.post<ApiResponse<LeaveRequest>>('leaves/apply', data);
  }

  getMyLeaves(params?: { page?: number; per_page?: number }): Observable<ApiResponse<LeaveRequest[]>> {
    return this.api.get<ApiResponse<LeaveRequest[]>>('leaves/history', params as any);
  }

  getById(id: number): Observable<ApiResponse<LeaveRequest>> {
    return this.api.get<ApiResponse<LeaveRequest>>(`leaves/${id}`);
  }

  cancel(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`leaves/${id}`);
  }

  getTeamLeaves(params?: { status?: string }): Observable<ApiResponse<LeaveRequest[]>> {
    return this.api.get<ApiResponse<LeaveRequest[]>>('manager/approvals/leaves', params as any);
  }

  approve(id: number, notes?: string): Observable<ApiResponse<LeaveRequest>> {
    return this.api.post<ApiResponse<LeaveRequest>>(`manager/approvals/leaves/${id}/action`, {
      status: 'approved',
      notes,
    });
  }

  reject(id: number, notes?: string): Observable<ApiResponse<LeaveRequest>> {
    return this.api.post<ApiResponse<LeaveRequest>>(`manager/approvals/leaves/${id}/action`, {
      status: 'rejected',
      notes,
    });
  }
}
