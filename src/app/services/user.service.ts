import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, ManagerDashboardData, ApiResponse } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>('profile');
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>('profile/update', data);
  }

  getEmployeeDashboard(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('dashboard');
  }

  getManagerDashboard(): Observable<ApiResponse<ManagerDashboardData>> {
    return this.api.get<ApiResponse<ManagerDashboardData>>('dashboard');
  }

  getManagerTeam(): Observable<ApiResponse<any[]>> {
    return this.api.get<ApiResponse<any[]>>('team').pipe(
      catchError((error) => {
        if (error?.status !== 404) {
          return throwError(() => error);
        }

        return this.getManagerDashboard().pipe(
          map((response) => ({
            success: response.success,
            message: response.message,
            data: response.data?.today_attendance ?? [],
          }))
        );
      })
    );
  }

}
