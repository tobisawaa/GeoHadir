import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, TeamMember, DashboardStats, EmployeeDashboardData, ManagerDashboardData, ApiResponse } from '../interfaces/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>('auth/profile');
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>('auth/profile', data);
  }

  getEmployeeDashboard(): Observable<ApiResponse<EmployeeDashboardData>> {
    return this.api.get<ApiResponse<EmployeeDashboardData>>('dashboard/employee');
  }

  getManagerDashboard(): Observable<ApiResponse<ManagerDashboardData>> {
    return this.api.get<ApiResponse<ManagerDashboardData>>('dashboard/manager');
  }

  getTeamMembers(): Observable<ApiResponse<TeamMember[]>> {
    return this.api.get<ApiResponse<TeamMember[]>>('team');
  }

  getTeamMemberById(id: number): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`team/${id}`);
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.api.get<ApiResponse<DashboardStats>>('dashboard/stats');
  }
}
