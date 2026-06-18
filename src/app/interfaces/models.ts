export interface User {
  id: number;
  employee_id?: string | number;
  employee_code?: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  department: string;
  position: string;
  phone: string;
  avatar?: string;
  join_date: string;
  manager?: string;
  manager_name?: string;
  work_location?: string;
  location?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  check_in: string;
  check_out: string | null;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat: number | null;
  check_out_lng: number | null;
  status: 'present' | 'late' | 'absent';
  date: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name?: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'other';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OvertimeRequest {
  id: number;
  user_id: number;
  user_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: number;
  user_id: number;
  user_name?: string;
  period: string;
  base_salary: number;
  overtime_pay: number;
  allowances: number;
  deductions: number;
  deduction_details?: { label: string; amount: number }[];
  tax: number;
  net_salary: number;
  generated_at: string;
}

export interface PayrollHistory {
  id: number;
  user_id: number;
  period: string;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  status: 'paid' | 'pending' | 'cancelled';
  paid_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  avatar?: string;
  attendance_today?: 'present' | 'late' | 'absent' | null;
}

export interface DashboardStats {
  total_members?: number;
  total_present: number;
  total_absent: number;
  total_late: number;
  pending_leave: number;
  pending_overtime: number;
  attendance_percentage: number;
}

export interface EmployeeDashboardData {
  today_attendance: Attendance | null;
  recent_leave: LeaveRequest[];
  recent_overtime: OvertimeRequest[];
  attendance_this_month: number;
  remaining_leave: number;
  upcoming_payslip: Payslip | null;
}

export interface ManagerDashboardData {
  team_stats: DashboardStats;
  today_attendance: TeamAttendanceRow[];
  pending_requests: {
    leave: number;
    overtime: number;
  };
}

export interface TeamAttendanceRow {
  id?: number | null;
  user_id: number;
  employee_id: number;
  name: string;
  position: string;
  department: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'late' | 'absent' | string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
