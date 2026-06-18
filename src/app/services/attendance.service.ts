import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Attendance, ApiResponse } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}

  checkIn(data: { lat: number; lng: number }): Observable<ApiResponse<Attendance>> {
    return this.api.post<ApiResponse<Attendance>>('attendance/check-in', {
      latitude: data.lat,
      longitude: data.lng,
    });
  }

  checkOut(data: { lat: number; lng: number }): Observable<ApiResponse<Attendance>> {
    return this.api.post<ApiResponse<Attendance>>('attendance/check-out', {
      latitude: data.lat,
      longitude: data.lng,
    });
  }

  getToday(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('dashboard');
  }

  getHistory(params?: { page?: number; per_page?: number; month?: string }): Observable<ApiResponse<Attendance[]>> {
    return this.api.get<ApiResponse<Attendance[]>>('attendance/history', params as any);
  }

  getEmployeeHistory(userId: number, params?: { month?: string }): Observable<ApiResponse<Attendance[]>> {
    return this.getHistory(params);
  }
}
