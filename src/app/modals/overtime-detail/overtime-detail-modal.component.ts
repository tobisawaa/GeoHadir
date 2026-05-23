import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OvertimeRequest } from '../../interfaces/models';

@Component({
  selector: 'app-overtime-detail-modal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar style="--background: #0f172a; --color: #ffffff;">
        <ion-title>Detail Lembur</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" style="--color: #ffffff;">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content style="--background: #f8f7f4;">
      <div style="padding: 16px;" *ngIf="data">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; background: #ffffff; border-radius: 14px; padding: 14px 16px; border: 1px solid rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #0f172a;">
            <ion-icon name="time-outline" style="font-size: 20px; color: #059669;"></ion-icon>
            <span>{{ data.date | date:'dd MMMM yyyy' }}</span>
          </div>
          <app-status-badge [status]="data.status"></app-status-badge>
        </div>

        <div style="background: #ffffff; border-radius: 14px; padding: 4px 16px; border: 1px solid rgba(0,0,0,0.03);">
          <div style="padding: 12px 0; border-bottom: 1px solid #f0efec;">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Waktu Mulai</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500;">{{ data.start_time }}</span>
          </div>
          <div style="padding: 12px 0; border-bottom: 1px solid #f0efec;">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Waktu Selesai</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500;">{{ data.end_time }}</span>
          </div>
          <div style="padding: 12px 0; border-bottom: 1px solid #f0efec;">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Durasi</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500;">{{ data.duration_hours }} jam</span>
          </div>
          <div style="padding: 12px 0; border-bottom: 1px solid #f0efec;" *ngIf="data.user_name">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Karyawan</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500;">{{ data.user_name }}</span>
          </div>
          <div style="padding: 12px 0; border-bottom: 1px solid #f0efec;">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Alasan</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500; white-space: pre-wrap; line-height: 1.5;">{{ data.reason }}</span>
          </div>
          <div style="padding: 12px 0; border-bottom: 1px solid #f0efec;" *ngIf="data.notes">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Catatan</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500; white-space: pre-wrap; line-height: 1.5;">{{ data.notes }}</span>
          </div>
          <div style="padding: 12px 0;">
            <span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Diajukan Pada</span>
            <span style="font-size: 15px; color: #0f172a; font-weight: 500;">{{ data.created_at | date:'dd MMMM yyyy, HH:mm' }}</span>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    @media (prefers-color-scheme: dark) {
      ion-content { --background: #0f172a !important; }
      div[style*="background: #ffffff"] { background: #1e293b !important; border-color: rgba(255,255,255,0.04) !important; }
      div[style*="border-bottom"] { border-bottom-color: #334155 !important; }
      span[style*="color: #0f172a"] { color: #f1f5f9 !important; }
    }
  `],
  standalone: false,
})
export class OvertimeDetailModalComponent {
  @Input() data?: OvertimeRequest;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
