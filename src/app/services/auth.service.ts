import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
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
    if (environment.useMock) {
      return this.mockLogin(credentials).pipe(
        tap((res) => {
          this.setSession(res);
        })
      );
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
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
    return this.http.put(`${this.apiUrl}/auth/change-password`, data, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }

  private mockLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    const email = String(credentials.email || '').trim().toLowerCase();
    const password = String(credentials.password || '').trim();

    if (!email || password.length < 6) {
      return throwError(() => ({
        error: {
          message: 'Email dan password wajib diisi dengan benar.',
        },
      }));
    }

    let role: 'employee' | 'manager' = 'employee';
    let name = 'Muhamad Ridho';
    let position = 'Frontend Developer';

    if (email.includes('manager')) {
      role = 'manager';
      name = 'Manager Demo';
      position = 'Team Manager';
    }

    const user = {
      id: role === 'manager' ? 2 : 1,
      name,
      email,
      role,
      position,
      department: 'Information Technology',
      phone: '0812-3456-7890',
    } as unknown as User;

    const response = {
      token: `mock-token-${role}-${Date.now()}`,
      user,
    } as AuthResponse;

    return of(response).pipe(delay(500));
  }
}
