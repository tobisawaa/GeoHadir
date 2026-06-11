import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
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
      await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });

      return true;
    } catch {
      return false;
    }
  }

  private resolveLocationError(error: any): string {
    const message = String(error?.message || '').toLowerCase();

    if (message.includes('permission') || message.includes('denied')) {
      return 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di pengaturan aplikasi.';
    }

    if (message.includes('timeout')) {
      return 'Waktu permintaan lokasi habis. Pastikan GPS aktif lalu coba lagi.';
    }

    if (message.includes('unavailable')) {
      return 'Informasi lokasi tidak tersedia. Pastikan GPS aktif dan sinyal stabil.';
    }

    return 'Gagal mendapatkan lokasi. Silakan aktifkan GPS lalu coba lagi.';
  }
}