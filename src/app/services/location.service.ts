import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

declare const navigator: any;

export interface GeoPosition {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {

  getCurrentPosition(): Observable<GeoPosition> {
    return from(this.getPositionPromise());
  }

  private getPositionPromise(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser ini'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error: any) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Izin lokasi ditolak. Silakan aktifkan GPS di pengaturan.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Informasi lokasi tidak tersedia. Pastikan GPS aktif.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Waktu permintaan lokasi habis. Silakan coba lagi.'));
              break;
            default:
              reject(new Error('Gagal mendapatkan lokasi. Silakan coba lagi.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }

  isGpsEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 3000, enableHighAccuracy: true }
      );
    });
  }
}
