import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  {
  path: 'welcome',
  loadChildren: () =>
    import('./pages/welcome/welcome.module').then((m) => m.WelcomePageModule),
},
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'employee',
        canActivate: [RoleGuard],
        data: { roles: ['employee'] },
        children: [
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./pages/employee/dashboard/dashboard.module').then(
                (m) => m.DashboardPageModule
              ),
          },
          {
            path: 'attendance',
            loadChildren: () =>
              import('./pages/employee/attendance/attendance.module').then(
                (m) => m.AttendancePageModule
              ),
          },
          {
            path: 'attendance-history',
            loadChildren: () =>
              import('./pages/employee/attendance-history/attendance-history.module').then(
                (m) => m.AttendanceHistoryPageModule
              ),
          },
          {
            path: 'requests',
            loadChildren: () =>
              import('./pages/employee/requests/requests.module').then(
                (m) => m.RequestsPageModule
              ),
          },
          {
            path: 'leave',
            loadChildren: () =>
              import('./pages/employee/leave/leave.module').then(
                (m) => m.LeavePageModule
              ),
          },
          {
            path: 'leave-history',
            loadChildren: () =>
              import('./pages/employee/leave-history/leave-history.module').then(
                (m) => m.LeaveHistoryPageModule
              ),
          },
          {
            path: 'overtime',
            loadChildren: () =>
              import('./pages/employee/overtime/overtime.module').then(
                (m) => m.OvertimePageModule
              ),
          },
          {
            path: 'overtime-history',
            loadChildren: () =>
              import('./pages/employee/overtime-history/overtime-history.module').then(
                (m) => m.OvertimeHistoryPageModule
              ),
          },
          {
            path: 'payslip',
            loadChildren: () =>
              import('./pages/employee/payslip/payslip.module').then(
                (m) => m.PayslipPageModule
              ),
          },
          {
            path: 'payroll-history',
            loadChildren: () =>
              import('./pages/employee/payroll-history/payroll-history.module').then(
                (m) => m.PayrollHistoryPageModule
              ),
          },
          {
            path: 'history-hub',
            loadChildren: () =>
              import('./pages/employee/history-hub/history-hub.module').then(
                (m) => m.HistoryHubPageModule
              ),
          },
          {
            path: 'profile',
            loadChildren: () =>
              import('./pages/employee/profile/profile.module').then(
                (m) => m.ProfilePageModule
              ),
          },
          {
            path: 'change-password',
            loadChildren: () =>
              import('./pages/employee/change-password/change-password.module').then(
                (m) => m.ChangePasswordPageModule
              ),
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'manager',
        canActivate: [RoleGuard],
        data: { roles: ['manager'] },
        children: [
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./pages/manager/dashboard/dashboard.module').then(
                (m) => m.DashboardPageModule
              ),
          },
          {
            path: 'team',
            loadChildren: () =>
              import('./pages/manager/team/team.module').then(
                (m) => m.TeamPageModule
              ),
          },
          {
            path: 'team-attendance',
            loadChildren: () =>
              import('./pages/manager/team-attendance/team-attendance.module').then(
                (m) => m.TeamAttendancePageModule
              ),
          },
          {
            path: 'team-leave',
            loadChildren: () =>
              import('./pages/manager/team-leave/team-leave.module').then(
                (m) => m.TeamLeavePageModule
              ),
          },
          {
            path: 'team-overtime',
            loadChildren: () =>
              import('./pages/manager/team-overtime/team-overtime.module').then(
                (m) => m.TeamOvertimePageModule
              ),
          },
          {
            path: 'profile',
            loadChildren: () =>
              import('./pages/manager/profile/profile.module').then(
                (m) => m.ProfilePageModule
              ),
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: 'employee/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
},
  {
    path: '**',
    redirectTo: 'login',
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}