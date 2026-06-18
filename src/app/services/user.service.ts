import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

}
