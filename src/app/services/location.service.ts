import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  getCurrentPosition(): Observable<GeoPosition> {
    return from(this.getCurrentPositionPromise());
  }

  async getCurrentPositionPromise(): Promise<GeoPosition> {
    if (!Capacitor.isNativePlatform()) {
      return this.getBrowserPosition();
    }

    try {
      const permission = await Geolocation.requestPermissions();

      if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
        throw new Error('Izin lokasi belum diberikan. Silakan aktifkan izin lokasi aplikasi.');
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch (error: any) {
      throw new Error(this.resolveLocationError(error));
    }
  }

  async isGpsEnabled(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      } else {
        await this.getBrowserPosition(5000);
      }

      return true;
    } catch {
      return false;
    }
  }

  private getBrowserPosition(timeout = 15000): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Browser tidak mendukung akses lokasi.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(this.resolveLocationError(error)));
        },
        {
          enableHighAccuracy: true,
          timeout,
          maximumAge: 0,
        }
      );
    });
  }

  private resolveLocationError(error: any): string {
    const message = String(error?.message || '').toLowerCase();
    const code = Number(error?.code || 0);

    if (code === 1 || message.includes('permission') || message.includes('denied')) {
      return 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di pengaturan aplikasi.';
    }

    if (code === 3 || message.includes('timeout')) {
      return 'Waktu permintaan lokasi habis. Pastikan GPS aktif lalu coba lagi.';
    }

    if (code === 2 || message.includes('unavailable')) {
      return 'Informasi lokasi tidak tersedia. Pastikan GPS aktif dan sinyal stabil.';
    }

    return 'Gagal mendapatkan lokasi. Silakan aktifkan GPS lalu coba lagi.';
  }
}
