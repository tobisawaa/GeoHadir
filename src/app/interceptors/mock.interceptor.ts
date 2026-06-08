import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  User,
  Attendance,
  LeaveRequest,
  OvertimeRequest,
  Payslip,
  PayrollHistory,
  TeamMember,
  EmployeeDashboardData,
  ManagerDashboardData,
} from '../interfaces/models';

interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'manager';
  department: string;
  position: string;
  phone: string;
  join_date: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    name: 'Ridho Pratama',
    email: 'employee@geohadir.com',
    password: 'password123',
    role: 'employee',
    department: 'Teknologi Informasi',
    position: 'Staff Developer',
    phone: '081234567890',
    join_date: '2024-01-15',
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    email: 'manager@geohadir.com',
    password: 'password123',
    role: 'manager',
    department: 'Teknologi Informasi',
    position: 'Manager IT',
    phone: '081234567891',
    join_date: '2022-06-01',
  },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 4, name: 'Ahmad Fauzi', email: 'ahmad@geohadir.com', position: 'Staff Developer', department: 'Teknologi Informasi', phone: '081234567893', attendance_today: 'present' },
  { id: 5, name: 'Dewi Lestari', email: 'dewi@geohadir.com', position: 'Staff Developer', department: 'Teknologi Informasi', phone: '081234567894', attendance_today: 'present' },
  { id: 6, name: 'Budi Santoso', email: 'budi@geohadir.com', position: 'Staff Developer', department: 'Teknologi Informasi', phone: '081234567895', attendance_today: 'late' },
  { id: 7, name: 'Citra Ayu', email: 'citra@geohadir.com', position: 'Junior Developer', department: 'Teknologi Informasi', phone: '081234567896', attendance_today: 'absent' },
  { id: 1, name: 'Ridho Pratama', email: 'employee@geohadir.com', position: 'Staff Developer', department: 'Teknologi Informasi', phone: '081234567890', attendance_today: 'present' },
];

let attendanceRecords: Attendance[] = [];
let leaveRecords: LeaveRequest[] = [];
let overtimeRecords: OvertimeRequest[] = [];
let userIdCounter = 8;
let attendanceIdCounter = 1;
let leaveIdCounter = 1;
let overtimeIdCounter = 1;

function initMockData(): void {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  attendanceRecords = [
    { id: attendanceIdCounter++, user_id: 1, check_in: `${todayStr}T07:55:00`, check_out: `${todayStr}T17:05:00`, check_in_lat: -6.2088, check_in_lng: 106.8456, check_out_lat: -6.2088, check_out_lng: 106.8456, status: 'present', date: todayStr },
    { id: attendanceIdCounter++, user_id: 4, check_in: `${todayStr}T08:00:00`, check_out: null, check_in_lat: -6.2088, check_in_lng: 106.8456, check_out_lat: null, check_out_lng: null, status: 'present', date: todayStr },
    { id: attendanceIdCounter++, user_id: 5, check_in: `${todayStr}T07:50:00`, check_out: `${todayStr}T17:10:00`, check_in_lat: -6.2088, check_in_lng: 106.8456, check_out_lat: -6.2088, check_out_lng: 106.8456, status: 'present', date: todayStr },
    { id: attendanceIdCounter++, user_id: 6, check_in: `${todayStr}T08:30:00`, check_out: null, check_in_lat: -6.2088, check_in_lng: 106.8456, check_out_lat: null, check_out_lng: null, status: 'late', date: todayStr },
  ];

  for (let d = 1; d <= 20; d++) {
    const pastDate = new Date(today.getFullYear(), today.getMonth(), d);
    if (pastDate >= today) break;
    const ds = pastDate.toISOString().split('T')[0];
    const dayOfWeek = pastDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    attendanceRecords.push({
      id: attendanceIdCounter++, user_id: 1,
      check_in: `${ds}T08:0${d % 5}:00`, check_out: `${ds}T17:0${d % 5}:00`,
      check_in_lat: -6.2088, check_in_lng: 106.8456,
      check_out_lat: -6.2088, check_out_lng: 106.8456,
      status: d % 7 === 0 ? 'late' : 'present', date: ds,
    });
  }

  leaveRecords = [
    { id: leaveIdCounter++, user_id: 1, user_name: 'Ridho Pratama', type: 'sick', start_date: '2026-05-10', end_date: '2026-05-11', reason: 'Kurang enak badan, demam', status: 'approved', notes: 'Cepat sembuh', created_at: '2026-05-09T08:00:00', updated_at: '2026-05-09T10:00:00' },
    { id: leaveIdCounter++, user_id: 1, user_name: 'Ridho Pratama', type: 'annual', start_date: '2026-06-15', end_date: '2026-06-17', reason: 'Liburan keluarga ke Bali', status: 'pending', notes: '', created_at: '2026-05-20T09:00:00', updated_at: '2026-05-20T09:00:00' },
    { id: leaveIdCounter++, user_id: 4, user_name: 'Ahmad Fauzi', type: 'personal', start_date: '2026-05-25', end_date: '2026-05-25', reason: 'Ada acara keluarga', status: 'pending', notes: '', created_at: '2026-05-18T10:00:00', updated_at: '2026-05-18T10:00:00' },
    { id: leaveIdCounter++, user_id: 5, user_name: 'Dewi Lestari', type: 'sick', start_date: '2026-05-12', end_date: '2026-05-14', reason: 'Sakit gigi, perlu istirahat', status: 'approved', notes: 'Semoga lekas sembuh', created_at: '2026-05-11T07:30:00', updated_at: '2026-05-11T14:00:00' },
    { id: leaveIdCounter++, user_id: 6, user_name: 'Budi Santoso', type: 'annual', start_date: '2026-06-01', end_date: '2026-06-03', reason: 'Cuti tahunan', status: 'rejected', notes: 'Bentrok dengan jadwal project', created_at: '2026-05-15T11:00:00', updated_at: '2026-05-16T09:00:00' },
  ];

  overtimeRecords = [
    { id: overtimeIdCounter++, user_id: 1, user_name: 'Ridho Pratama', date: '2026-05-18', start_time: '18:00', end_time: '20:30', duration_hours: 2.5, reason: 'Menyelesaikan bug sebelum deadline', status: 'approved', notes: 'Terima kasih', created_at: '2026-05-18T10:00:00', updated_at: '2026-05-18T12:00:00' },
    { id: overtimeIdCounter++, user_id: 1, user_name: 'Ridho Pratama', date: '2026-05-22', start_time: '17:30', end_time: '19:00', duration_hours: 1.5, reason: 'Persiapan demo aplikasi', status: 'pending', notes: '', created_at: '2026-05-22T10:00:00', updated_at: '2026-05-22T10:00:00' },
    { id: overtimeIdCounter++, user_id: 4, user_name: 'Ahmad Fauzi', date: '2026-05-20', start_time: '18:00', end_time: '21:00', duration_hours: 3, reason: 'Deploy fitur baru', status: 'pending', notes: '', created_at: '2026-05-20T09:00:00', updated_at: '2026-05-20T09:00:00' },
    { id: overtimeIdCounter++, user_id: 5, user_name: 'Dewi Lestari', date: '2026-05-17', start_time: '17:00', end_time: '19:30', duration_hours: 2.5, reason: 'Testing integration', status: 'approved', notes: 'Approved', created_at: '2026-05-17T08:00:00', updated_at: '2026-05-17T10:00:00' },
  ];
}

initMockData();

function getUser(id: number): MockUser | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

function toUser(mock: MockUser): User {
  return {
    id: mock.id,
    name: mock.name,
    email: mock.email,
    role: mock.role,
    department: mock.department,
    position: mock.position,
    phone: mock.phone,
    join_date: mock.join_date,
  };
}

@Injectable()
export class MockInterceptor implements HttpInterceptor {
  private apiUrl = environment.apiUrl;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.production || !req.url.startsWith(this.apiUrl)) {
      return next.handle(req);
    }

    const url = req.url.replace(this.apiUrl, '');
    const method = req.method;
    const body = req.body;
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token && url !== '/auth/login') {
      return of(new HttpResponse({ status: 401, body: { success: false, message: 'Unauthorized' } })).pipe(delay(300));
    }

    let currentUser: MockUser | undefined;
    if (token) {
      const parts = token.split('_');
      const userId = parseInt(parts.length >= 3 ? parts[2] : parts[1], 10);
      currentUser = getUser(userId);
      if (!currentUser) {
        return of(new HttpResponse({ status: 401, body: { success: false, message: 'User not found' } })).pipe(delay(300));
      }
    }

    switch (true) {
      // AUTH
      case url === '/auth/login' && method === 'POST': return this.handleLogin(body);
      case url === '/auth/change-password' && method === 'PUT': return this.handleChangePassword(currentUser!);
      case url === '/auth/profile' && method === 'GET': return this.handleGetProfile(currentUser!);
      case url === '/auth/profile' && method === 'PUT': return this.handleUpdateProfile(currentUser!, body);

      // ATTENDANCE
      case url === '/attendance/check-in' && method === 'POST': return this.handleCheckIn(currentUser!, body);
      case url === '/attendance/check-out' && method === 'POST': return this.handleCheckOut(currentUser!, body);
      case url === '/attendance/today' && method === 'GET': return this.handleGetToday(currentUser!);
      case url.startsWith('/attendance/history') && method === 'GET': return this.handleAttendanceHistory(currentUser!);
      case url.startsWith('/attendance/employee/') && method === 'GET': return this.handleAttendanceHistory(currentUser!);

      // LEAVES
      case url === '/leaves' && method === 'POST': return this.handleCreateLeave(currentUser!, body);
      case url.startsWith('/leaves/my') && method === 'GET': return this.handleMyLeaves(currentUser!);
      case url.startsWith('/leaves/team') && method === 'GET': return this.handleTeamLeaves(currentUser!);
      case url.match(/^\/leaves\/(\d+)$/) && method === 'GET': return this.handleGetLeave(url);
      case url.match(/^\/leaves\/(\d+)$/) && method === 'DELETE': return this.handleCancelLeave(url, currentUser!);
      case url.match(/^\/leaves\/(\d+)\/approve$/) && method === 'PATCH': return this.handleApproveLeave(url, body);
      case url.match(/^\/leaves\/(\d+)\/reject$/) && method === 'PATCH': return this.handleRejectLeave(url, body);

      // OVERTIMES
      case url === '/overtimes' && method === 'POST': return this.handleCreateOvertime(currentUser!, body);
      case url.startsWith('/overtimes/my') && method === 'GET': return this.handleMyOvertimes(currentUser!);
      case url.startsWith('/overtimes/team') && method === 'GET': return this.handleTeamOvertimes(currentUser!);
      case url.match(/^\/overtimes\/(\d+)$/) && method === 'GET': return this.handleGetOvertime(url);
      case url.match(/^\/overtimes\/(\d+)$/) && method === 'DELETE': return this.handleCancelOvertime(url, currentUser!);
      case url.match(/^\/overtimes\/(\d+)\/approve$/) && method === 'PATCH': return this.handleApproveOvertime(url, body);
      case url.match(/^\/overtimes\/(\d+)\/reject$/) && method === 'PATCH': return this.handleRejectOvertime(url, body);

      // PAYROLL
      case url === '/payroll/latest' && method === 'GET': return this.handleLatestPayslip(currentUser!);
      case url.startsWith('/payroll/payslip/') && method === 'GET': return this.handlePayslipByPeriod(currentUser!);
      case url === '/payroll/history' && method === 'GET': return this.handlePayrollHistory(currentUser!);
      case url.match(/^\/payroll\/(\d+)$/) && method === 'GET': return this.handlePayslipById(currentUser!);

      // DASHBOARD
      case url === '/dashboard/employee' && method === 'GET': return this.handleEmployeeDashboard(currentUser!);
      case url === '/dashboard/manager' && method === 'GET': return this.handleManagerDashboard(currentUser!);
      case url === '/dashboard/stats' && method === 'GET': return this.handleDashboardStats();

      // TEAM
      case url === '/team' && method === 'GET': return this.handleTeamList();
      case url.match(/^\/team\/(\d+)$/) && method === 'GET': return this.handleTeamMember(url);

      default:
        return next.handle(req);
    }
  }

  private ok(data: any, delayMs = 400) {
    return of(new HttpResponse({ status: 200, body: { success: true, data } })).pipe(delay(delayMs));
  }

  private fail(msg: string, status = 400, delayMs = 300) {
    return of(new HttpResponse({ status, body: { success: false, message: msg } })).pipe(delay(delayMs));
  }

  private handleLogin(body: any) {
    const { email, password } = body || {};
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      return this.fail('Email atau password salah', 401);
    }
    const token = `mock_token_${user.id}_${Date.now()}`;
    return of(new HttpResponse({
      status: 200,
      body: { user: toUser(user), token },
    })).pipe(delay(600));
  }

  private handleChangePassword(user: MockUser) {
    return this.ok({ message: 'Password berhasil diubah' });
  }

  private handleGetProfile(user: MockUser) {
    return this.ok(toUser(user));
  }

  private handleUpdateProfile(user: MockUser, body: any) {
    Object.assign(user, body);
    return this.ok(toUser(user));
  }

  private handleCheckIn(user: MockUser, body: any) {
    const today = new Date().toISOString().split('T')[0];
    const existing = attendanceRecords.find(a => a.user_id === user.id && a.date === today && a.check_in);
    if (existing) {
      return this.fail('Anda sudah melakukan check in hari ini');
    }
    const now = new Date();
    const hour = now.getHours();
    const isLate = hour >= 9;
    const record: Attendance = {
      id: attendanceIdCounter++, user_id: user.id,
      check_in: now.toISOString(), check_out: null,
      check_in_lat: body?.lat || -6.2088, check_in_lng: body?.lng || 106.8456,
      check_out_lat: null, check_out_lng: null,
      status: isLate ? 'late' : 'present', date: today,
    };
    attendanceRecords.unshift(record);
    return this.ok(record, 500);
  }

  private handleCheckOut(user: MockUser, body: any) {
    const today = new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(a => a.user_id === user.id && a.date === today && a.check_in && !a.check_out);
    if (!record) {
      return this.fail('Belum ada check in atau sudah check out');
    }
    record.check_out = new Date().toISOString();
    record.check_out_lat = body?.lat || -6.2088;
    record.check_out_lng = body?.lng || 106.8456;
    return this.ok(record, 500);
  }

  private handleGetToday(user: MockUser) {
    const today = new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(a => a.user_id === user.id && a.date === today);
    return this.ok(record || null);
  }

  private handleAttendanceHistory(user: MockUser) {
    const records = attendanceRecords.filter(a => a.user_id === user.id).sort((a, b) => b.date.localeCompare(a.date));
    return this.ok(records);
  }

  private handleCreateLeave(user: MockUser, body: any) {
    const record: LeaveRequest = {
      id: leaveIdCounter++, user_id: user.id, user_name: user.name,
      type: body.type, start_date: body.start_date, end_date: body.end_date,
      reason: body.reason, status: 'pending', notes: '',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    leaveRecords.unshift(record);
    return this.ok(record, 500);
  }

  private handleMyLeaves(user: MockUser) {
    const records = leaveRecords.filter(l => l.user_id === user.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return this.ok(records);
  }

  private handleGetLeave(url: string) {
    const match = url.match(/^\/leaves\/(\d+)$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const record = leaveRecords.find(l => l.id === id);
    if (!record) return this.fail('Not found', 404);
    return this.ok(record);
  }

  private handleCancelLeave(url: string, currentUser: MockUser) {
    const match = url.match(/^\/leaves\/(\d+)$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const idx = leaveRecords.findIndex(l => l.id === id && l.user_id === currentUser.id);
    if (idx === -1) return this.fail('Not found', 404);
    if (leaveRecords[idx].status !== 'pending') return this.fail('Hanya dapat membatalkan pengajuan yang masih pending');
    leaveRecords.splice(idx, 1);
    return this.ok({ message: 'Berhasil dibatalkan' });
  }

  private handleApproveLeave(url: string, body: any) {
    const match = url.match(/^\/leaves\/(\d+)\/approve$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const record = leaveRecords.find(l => l.id === id);
    if (!record) return this.fail('Not found', 404);
    record.status = 'approved';
    record.notes = body?.notes || record.notes;
    record.updated_at = new Date().toISOString();
    return this.ok(record);
  }

  private handleRejectLeave(url: string, body: any) {
    const match = url.match(/^\/leaves\/(\d+)\/reject$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const record = leaveRecords.find(l => l.id === id);
    if (!record) return this.fail('Not found', 404);
    record.status = 'rejected';
    record.notes = body?.notes || 'Ditolak';
    record.updated_at = new Date().toISOString();
    return this.ok(record);
  }

  private handleTeamLeaves(currentUser: MockUser) {
    if (currentUser.role !== 'manager') return this.fail('Forbidden', 403);
    const teamUserIds = TEAM_MEMBERS.map(m => m.id);
    const records = leaveRecords.filter(l => teamUserIds.includes(l.user_id)).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return this.ok(records);
  }

  private handleCreateOvertime(user: MockUser, body: any) {
    const record: OvertimeRequest = {
      id: overtimeIdCounter++, user_id: user.id, user_name: user.name,
      date: body.date, start_time: body.start_time, end_time: body.end_time,
      duration_hours: body.duration_hours, reason: body.reason,
      status: 'pending', notes: '',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    overtimeRecords.unshift(record);
    return this.ok(record, 500);
  }

  private handleMyOvertimes(user: MockUser) {
    const records = overtimeRecords.filter(o => o.user_id === user.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return this.ok(records);
  }

  private handleTeamOvertimes(currentUser: MockUser) {
    if (currentUser.role !== 'manager') return this.fail('Forbidden', 403);
    const teamUserIds = TEAM_MEMBERS.map(m => m.id);
    const records = overtimeRecords.filter(o => teamUserIds.includes(o.user_id)).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return this.ok(records);
  }

  private handleGetOvertime(url: string) {
    const match = url.match(/^\/overtimes\/(\d+)$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const record = overtimeRecords.find(o => o.id === id);
    if (!record) return this.fail('Not found', 404);
    return this.ok(record);
  }

  private handleCancelOvertime(url: string, currentUser: MockUser) {
    const match = url.match(/^\/overtimes\/(\d+)$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const idx = overtimeRecords.findIndex(o => o.id === id && o.user_id === currentUser.id);
    if (idx === -1) return this.fail('Not found', 404);
    if (overtimeRecords[idx].status !== 'pending') return this.fail('Hanya dapat membatalkan pengajuan yang masih pending');
    overtimeRecords.splice(idx, 1);
    return this.ok({ message: 'Berhasil dibatalkan' });
  }

  private handleApproveOvertime(url: string, body: any) {
    const match = url.match(/^\/overtimes\/(\d+)\/approve$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const record = overtimeRecords.find(o => o.id === id);
    if (!record) return this.fail('Not found', 404);
    record.status = 'approved';
    record.notes = body?.notes || record.notes;
    record.updated_at = new Date().toISOString();
    return this.ok(record);
  }

  private handleRejectOvertime(url: string, body: any) {
    const match = url.match(/^\/overtimes\/(\d+)\/reject$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const record = overtimeRecords.find(o => o.id === id);
    if (!record) return this.fail('Not found', 404);
    record.status = 'rejected';
    record.notes = body?.notes || 'Ditolak';
    record.updated_at = new Date().toISOString();
    return this.ok(record);
  }

  private handleLatestPayslip(user: MockUser) {
    const period = new Date().toISOString().slice(0, 7);
    const payslip: Payslip = {
      id: 1, user_id: user.id, user_name: user.name, period,
      base_salary: 8500000,
      overtime_pay: 450000,
      allowances: 500000,
      deductions: 750000,
      deduction_details: [
        { label: 'BPJS Kesehatan', amount: 85000 },
        { label: 'BPJS Ketenagakerjaan', amount: 170000 },
        { label: 'PPh 21', amount: 350000 },
        { label: 'Pinjaman Koperasi', amount: 145000 },
      ],
      tax: 350000,
      net_salary: 8700000,
      generated_at: new Date().toISOString(),
    };
    return this.ok(payslip);
  }

  private handlePayslipByPeriod(user: MockUser) {
    return this.handleLatestPayslip(user);
  }

  private handlePayrollHistory(user: MockUser) {
    const history: PayrollHistory[] = [
      { id: 1, user_id: user.id, period: '2026-05', total_earnings: 9450000, total_deductions: 750000, net_salary: 8700000, status: 'paid', paid_at: '2026-05-25T08:00:00' },
      { id: 2, user_id: user.id, period: '2026-04', total_earnings: 9200000, total_deductions: 720000, net_salary: 8480000, status: 'paid', paid_at: '2026-04-25T08:00:00' },
      { id: 3, user_id: user.id, period: '2026-03', total_earnings: 9000000, total_deductions: 700000, net_salary: 8300000, status: 'paid', paid_at: '2026-03-25T08:00:00' },
      { id: 4, user_id: user.id, period: '2026-02', total_earnings: 8800000, total_deductions: 680000, net_salary: 8120000, status: 'paid', paid_at: '2026-02-25T08:00:00' },
      { id: 5, user_id: user.id, period: '2026-06', total_earnings: 9500000, total_deductions: 750000, net_salary: 8750000, status: 'pending', paid_at: undefined },
    ];
    return this.ok(history);
  }

  private handlePayslipById(user: MockUser) {
    return this.handleLatestPayslip(user);
  }

  private handleEmployeeDashboard(user: MockUser) {
    const today = attendanceRecords.find(a => a.user_id === user.id && a.date === new Date().toISOString().split('T')[0]);
    const monthlyAttendances = attendanceRecords.filter(a => a.user_id === user.id);
    const myLeaves = leaveRecords.filter(l => l.user_id === user.id).slice(0, 3);
    const myOvertimes = overtimeRecords.filter(o => o.user_id === user.id).slice(0, 3);

    const data: EmployeeDashboardData = {
      today_attendance: today || null,
      recent_leave: myLeaves,
      recent_overtime: myOvertimes,
      attendance_this_month: monthlyAttendances.length,
      remaining_leave: 8,
      upcoming_payslip: null,
    };
    return this.ok(data);
  }

  private handleManagerDashboard(currentUser: MockUser) {
    const todayAttendances = TEAM_MEMBERS.map(m => {
      const att = attendanceRecords.find(a => a.user_id === m.id && a.date === new Date().toISOString().split('T')[0]);
      return { ...m, attendance_today: att?.status || null } as TeamMember;
    });
    const pendingLeaves = leaveRecords.filter(l => l.status === 'pending').length;
    const pendingOvertimes = overtimeRecords.filter(o => o.status === 'pending').length;

    const data: ManagerDashboardData = {
      team_stats: {
        total_present: todayAttendances.filter(m => m.attendance_today === 'present').length,
        total_absent: todayAttendances.filter(m => m.attendance_today === 'absent' || !m.attendance_today).length,
        total_late: todayAttendances.filter(m => m.attendance_today === 'late').length,
        pending_leave: pendingLeaves,
        pending_overtime: pendingOvertimes,
        attendance_percentage: Math.round((todayAttendances.filter(m => m.attendance_today === 'present' || m.attendance_today === 'late').length / todayAttendances.length) * 100),
      },
      today_attendance: todayAttendances,
      pending_requests: {
        leave: pendingLeaves,
        overtime: pendingOvertimes,
      },
    };
    return this.ok(data);
  }

  private handleDashboardStats() {
    return this.ok({
      total_present: 12,
      total_absent: 2,
      total_late: 1,
      pending_leave: 3,
      pending_overtime: 2,
      attendance_percentage: 85,
    });
  }

  private handleTeamList() {
    return this.ok(TEAM_MEMBERS);
  }

  private handleTeamMember(url: string) {
    const match = url.match(/^\/team\/(\d+)$/);
    if (!match) return this.fail('Not found', 404);
    const id = parseInt(match[1], 10);
    const member = TEAM_MEMBERS.find(m => m.id === id);
    if (!member) return this.fail('Not found', 404);
    return this.ok(member);
  }
}
