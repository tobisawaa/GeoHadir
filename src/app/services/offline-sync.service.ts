import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

type OfflineMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface OfflineQueueItem {
  id: string;
  method: OfflineMethod;
  endpoint: string;
  body?: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface OfflineSyncResult {
  synced: number;
  failed: number;
  pending: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private readonly queueKey = 'geohadir_offline_queue';
  private readonly apiUrl = environment.apiUrl;
  private readonly minSyncIntervalMs = 5000;

  private isSyncing = false;
  private lastSyncAttemptAt = 0;
  private queueCache: OfflineQueueItem[] = this.loadQueue();
  private onlineSubject = new BehaviorSubject<boolean>(this.readOnlineStatus());
  private pendingCountSubject = new BehaviorSubject<number>(this.queueCache.length);

  online$ = this.onlineSubject.asObservable();
  pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
    window.addEventListener('online', () => {
      this.onlineSubject.next(true);
      void this.syncWhenOnline(true);
    });

    window.addEventListener('offline', () => {
      this.onlineSubject.next(false);
    });
  }

  isOnline(): boolean {
    return this.onlineSubject.value;
  }

  shouldQueue(error: unknown): boolean {
    if (!this.isOnline()) {
      return true;
    }

    return error instanceof HttpErrorResponse && error.status === 0;
  }

  enqueue<T>(method: OfflineMethod, endpoint: string, body?: unknown): Observable<T> {
    const queue = this.getQueue();

    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method,
      endpoint,
      body,
      createdAt: new Date().toISOString(),
      attempts: 0,
    });

    this.saveQueue(queue);

    return of({
      success: true,
      queued: true,
      message: 'Data disimpan offline dan akan disinkronkan saat online.',
      data: null,
    } as T);
  }

  async syncWhenOnline(force = false): Promise<OfflineSyncResult> {
    if (!this.isOnline() || this.isSyncing || !this.auth.getToken()) {
      return { synced: 0, failed: 0, pending: this.getQueue().length };
    }

    const now = Date.now();
    const queue = this.getQueue();

    if (queue.length === 0) {
      return { synced: 0, failed: 0, pending: 0 };
    }

    if (!force && now - this.lastSyncAttemptAt < this.minSyncIntervalMs) {
      return { synced: 0, failed: 0, pending: queue.length };
    }

    this.lastSyncAttemptAt = now;
    this.isSyncing = true;

    let activeQueue = queue;
    let synced = 0;
    let failed = 0;

    while (activeQueue.length > 0) {
      const item = activeQueue[0];

      try {
        await this.replay(item);
        activeQueue.shift();
        synced += 1;
        this.saveQueue(activeQueue);
      } catch (error: any) {
        failed += 1;

        if (!this.isRetryable(error)) {
          activeQueue.shift();
          this.saveQueue(activeQueue);
          continue;
        }

        item.attempts += 1;
        item.lastError =
          error?.error?.message ||
          error?.message ||
          'Gagal sinkronisasi. Akan dicoba lagi saat online.';

        activeQueue = [item, ...activeQueue.slice(1)];
        this.saveQueue(activeQueue);
        break;
      }
    }

    this.isSyncing = false;
    return { synced, failed, pending: activeQueue.length };
  }

  getPendingCount(): number {
    return this.getQueue().length;
  }

  private replay(item: OfflineQueueItem): Promise<unknown> {
    const url = `${this.apiUrl}/${item.endpoint}`;
    const options = { headers: this.getHeaders() };

    switch (item.method) {
      case 'POST':
        return firstValueFrom(this.http.post(url, item.body, options));
      case 'PUT':
        return firstValueFrom(this.http.put(url, item.body, options));
      case 'PATCH':
        return firstValueFrom(this.http.patch(url, item.body, options));
      case 'DELETE':
        return firstValueFrom(this.http.delete(url, options));
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  private isRetryable(error: unknown): boolean {
    if (!this.isOnline()) {
      return true;
    }

    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    return error.status === 0 || error.status >= 500;
  }

  private readOnlineStatus(): boolean {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
  }

  private getQueue(): OfflineQueueItem[] {
    return [...this.queueCache];
  }

  private loadQueue(): OfflineQueueItem[] {
    const raw = localStorage.getItem(this.queueKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(this.queueKey);
      return [];
    }
  }

  private saveQueue(queue: OfflineQueueItem[]): void {
    this.queueCache = [...queue];
    localStorage.setItem(this.queueKey, JSON.stringify(this.queueCache));
    this.pendingCountSubject.next(this.queueCache.length);
  }
}
