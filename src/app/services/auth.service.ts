import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginCredentials } from '../interfaces/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly WELCOME_KEY = 'geohadir_welcome_done';
  private readonly PRIVACY_ACCEPTED_KEY = 'geohadir_privacy_accepted';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private apiUrl = environment.apiUrl;

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    if (token) {
      if (token.startsWith('mock-token') || token.startsWith('mock_token')) {
        this.clearAuthStorage();
        this.tokenSubject.next(null);
        this.currentUserSubject.next(null);
        return;
      }

      this.tokenSubject.next(token);
    }

    if (user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch {
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
      }
    }

    if (!token || !user) {
      this.tokenSubject.next(null);
      this.currentUserSubject.next(null);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((res) => this.normalizeAuthResponse(res)),
        tap((res) => {
          this.setSession(res);
        })
      );
  }

  logout(): void {
    this.clearAuthStorage();
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(this.WELCOME_KEY, 'true');
    localStorage.setItem(this.PRIVACY_ACCEPTED_KEY, 'true');

    this.currentUserSubject.next(res.user);
    this.tokenSubject.next(res.token);
  }

  private clearAuthStorage(): void {
    const keys = [
      this.TOKEN_KEY,
      this.USER_KEY,

      // fallback key lama / kemungkinan sisa testing
      'token',
      'authToken',
      'access_token',
      'hris_token',
      'geohadir_token',

      'user',
      'currentUser',
      'authUser',
      'userData',
      'loggedInUser',
      'hris_user',
      'geohadir_user',

      'role',
      'user_role',
      'auth_role',
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  getToken(): string | null {
    const memoryToken = this.tokenSubject.value;

    if (memoryToken) {
      return memoryToken;
    }

    const storageToken = localStorage.getItem(this.TOKEN_KEY);

    if (storageToken) {
      this.tokenSubject.next(storageToken);
      return storageToken;
    }

    return null;
  }

  getCurrentUser(): User | null {
    const memoryUser = this.currentUserSubject.value;

    if (memoryUser) {
      return memoryUser;
    }

    const storageUser = localStorage.getItem(this.USER_KEY);

    if (!storageUser) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(storageUser) as User;

      if (this.isLegacyMockUser(parsedUser)) {
        this.clearAuthStorage();
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
        return null;
      }

      this.currentUserSubject.next(parsedUser);
      return parsedUser;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      this.currentUserSubject.next(null);
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();

    return !!token && !!user;
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isEmployee(): boolean {
    return this.getRole() === 'employee';
  }

  isManager(): boolean {
    return this.getRole() === 'manager';
  }

  changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Observable<any> {
    const user = this.getCurrentUser();

    return this.http.post(`${this.apiUrl}/profile/update`, {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: data.new_password,
    }, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/profile/update`, data, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    }).pipe(map((res) => this.normalizeUser(res?.data ?? res)));
  }

  private normalizeAuthResponse(response: any): AuthResponse {
    const payload = response?.data ?? response;
    return {
      token: payload?.token,
      user: this.normalizeUser(payload?.user),
    };
  }

  private normalizeUser(user: any): User {
    const department = typeof user?.department === 'object'
      ? user.department?.name
      : user?.department;
    const position = typeof user?.position === 'object'
      ? user.position?.title
      : user?.position;
    const manager = typeof user?.manager === 'object'
      ? user.manager?.name
      : user?.manager;
    const workLocation = typeof user?.work_location === 'object'
      ? user.work_location?.name
      : user?.work_location ?? user?.location;

    return {
      ...user,
      employee_id: user?.employee_id ?? user?.employee?.id ?? user?.employee_code ?? '',
      employee_code: user?.employee_code ?? user?.employee?.code ?? '',
      role: user?.role === 'manager' ? 'manager' : 'employee',
      department: department ?? '',
      position: position ?? '',
      phone: user?.phone ?? '',
      join_date: user?.join_date ?? '',
      manager: manager ?? user?.manager_name ?? '',
      manager_name: user?.manager_name ?? manager ?? '',
      work_location: workLocation ?? '',
      location: user?.location ?? workLocation ?? '',
    } as User;
  }

  private isLegacyMockUser(user: User | null): boolean {
    if (!user) {
      return false;
    }

    return (
      user.email === 'employee@geohadir.com' ||
      user.email === 'manager@geohadir.com' ||
      user.name === 'Ridho Pratama' ||
      user.name === 'Muhamad Ridho' ||
      user.name === 'Manager Demo'
    );
  }
}
