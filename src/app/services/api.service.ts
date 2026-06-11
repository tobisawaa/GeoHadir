import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { OfflineSyncService } from './offline-sync.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private offlineSync: OfflineSyncService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params,
    });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.sendMutating<T>('POST', endpoint, body, () =>
      this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, {
        headers: this.getHeaders(),
      })
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.sendMutating<T>('PUT', endpoint, body, () =>
      this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, {
        headers: this.getHeaders(),
      })
    );
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.sendMutating<T>('PATCH', endpoint, body, () =>
      this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body, {
        headers: this.getHeaders(),
      })
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.sendMutating<T>('DELETE', endpoint, undefined, () =>
      this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
        headers: this.getHeaders(),
      })
    );
  }

  private sendMutating<T>(
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    body: unknown,
    requestFactory: () => Observable<T>
  ): Observable<T> {
    if (!this.offlineSync.isOnline()) {
      return this.offlineSync.enqueue<T>(method, endpoint, body);
    }

    return requestFactory().pipe(
      catchError((error) => {
        if (this.offlineSync.shouldQueue(error)) {
          return this.offlineSync.enqueue<T>(method, endpoint, body);
        }

        return throwError(() => error);
      })
    );
  }
}
