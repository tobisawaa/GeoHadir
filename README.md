# GeoHadir

GeoHadir adalah aplikasi HRIS mobile berbasis Ionic Angular untuk membantu karyawan dan manajer mengelola presensi berbasis lokasi, pengajuan cuti, lembur, persetujuan, profil, dan slip gaji.

## Fitur Utama

- Login akun karyawan dan manajer melalui API backend.
- Welcome/onboarding dengan persetujuan Kebijakan Privasi.
- Dashboard karyawan dengan jam, menu HR, dan aktivitas terbaru dari API.
- Presensi masuk dan pulang berbasis geolokasi.
- Validasi area presensi kampus Universitas Buana Perjuangan Karawang.
- Cooldown percobaan presensi saat lokasi berada di luar radius valid.
- Pengajuan dan riwayat cuti.
- Pengajuan dan riwayat lembur.
- Slip gaji dan riwayat payroll.
- Dashboard manajer untuk monitoring tim, presensi tim, dan persetujuan cuti/lembur.
- Offline sync untuk antrean aksi tertentu saat koneksi tidak stabil.
- Back button Android dengan konfirmasi keluar pada halaman utama/login/welcome.

## Stack

- Ionic Angular
- Angular 20
- Capacitor 8
- TypeScript
- Android native project via Capacitor

## Struktur Penting

```text
src/app/pages/employee      Halaman karyawan
src/app/pages/manager       Halaman manajer
src/app/pages/login         Halaman login
src/app/pages/welcome       Onboarding dan kebijakan privasi
src/app/services            Service API, auth, presensi, cuti, lembur, payroll
src/environments            Konfigurasi API
android                     Project Android hasil Capacitor
assets                      Source logo/splash untuk Capacitor
src/assets                  Asset yang dipakai aplikasi Angular
```

## Konfigurasi API

API aktif dikonfigurasi di:

```ts
src/environments/environment.ts
src/environments/environment.prod.ts
```

Saat ini keduanya mengarah ke:

```text
https://hris.gaskeunproject.site/api/v1
```

Pastikan backend menyediakan endpoint utama seperti:

- `POST /login`
- `GET /profile`
- `POST /profile/update`
- `GET /dashboard`
- `POST /attendance/check-in`
- `POST /attendance/check-out`
- `GET /attendance/history`
- `POST /leaves/apply`
- `GET /leaves/history`
- `POST /overtimes/apply`
- `GET /overtimes/history`
- `GET /payroll/slips`
- `GET /manager/approvals/leaves`
- `GET /manager/approvals/overtimes`

## Instalasi Lokal

Install dependency:

```bash
npm install
```

Jalankan di browser:

```bash
npm start
```

Build web:

```bash
npm run build
```

Catatan: gunakan Node.js LTS untuk build produksi. Jika memakai Node versi ganjil/non-LTS, Angular masih bisa build tetapi akan menampilkan warning.

## Android

Setelah perubahan web, build dan sync ke Android:

```bash
npm run build
npx cap sync android
```

Buka project Android:

```bash
npx cap open android
```

Build APK/AAB dilakukan dari Android Studio atau Gradle di folder `android`.

## Asset Logo dan Splash

Source asset utama:

```text
assets/logo.png
assets/splash.png
src/assets/logo.png
```

Jika logo atau splash diganti, generate ulang asset Capacitor bila diperlukan, lalu jalankan:

```bash
npx cap sync android
```

## Presensi dan Lokasi

Validasi presensi saat ini menggunakan titik Universitas Buana Perjuangan Karawang:

```text
Latitude:  -6.322082
Longitude: 107.305543
Radius:    500 meter
```

Jika lokasi pengguna berada di luar radius, presensi tidak langsung dikirim dan pengguna diberi cooldown 30 detik sebelum mencoba lagi.

## Git Workflow Singkat

Ambil perubahan terbaru:

```bash
git pull --rebase origin main
```

Push ke GitHub:

```bash
git push origin main
```

Jika push ditolak karena non-fast-forward, lakukan `git pull --rebase origin main` terlebih dahulu, selesaikan conflict jika ada, lalu push ulang.

## Catatan Deployment

- Jangan arahkan API mobile ke `localhost`, karena aplikasi di HP tidak bisa mengakses localhost komputer development.
- Gunakan domain HTTPS backend yang aktif.
- Pastikan permission lokasi aktif di Android.
- Setelah build web, selalu jalankan `npx cap sync android` agar asset terbaru masuk ke project Android.
