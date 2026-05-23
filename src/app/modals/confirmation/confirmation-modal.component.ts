import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar style="--background: #0f172a; --color: #ffffff;">
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content style="--background: #f8f7f4;">
      <div style="padding: 20px 16px;">
        <p style="font-size: 15px; line-height: 1.6; color: #0f172a; margin: 0 0 16px;">{{ message }}</p>
        <div *ngIf="showNotes" style="margin-top: 4px;">
          <label style="font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 6px;">Catatan (opsional)</label>
          <ion-textarea [(ngModel)]="notes" rows="3" placeholder="Tambahkan catatan..." style="--background: #ffffff; --border-radius: 12px; --padding-start: 12px; --padding-end: 12px; border: 1px solid #e2e8f0; border-radius: 12px;"></ion-textarea>
        </div>
      </div>
    </ion-content>
    <ion-footer style="background: #ffffff; border-top: 1px solid #f0efec;">
      <div style="display: flex; gap: 10px; padding: 12px 16px;">
        <ion-button fill="outline" expand="block" (click)="dismiss()" style="--border-radius: 12px; --border-color: #e2e8f0; --color: #64748b; font-weight: 600; text-transform: none;">Batal</ion-button>
        <ion-button fill="solid" expand="block" (click)="confirm()" style="--background: #059669; --border-radius: 12px; font-weight: 600; text-transform: none;">{{ confirmText }}</ion-button>
      </div>
    </ion-footer>
  `,
  styles: [`
    @media (prefers-color-scheme: dark) {
      ion-content { --background: #0f172a !important; }
      ion-content p { color: #f1f5f9 !important; }
      ion-footer { background: #1e293b !important; border-top-color: #334155 !important; }
      ion-textarea { --background: #1e293b !important; border-color: #334155 !important; }
    }
  `],
  standalone: false,
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Konfirmasi';
  @Input() message: string = 'Apakah Anda yakin?';
  @Input() confirmText: string = 'Ya';
  @Input() confirmColor: string = 'primary';
  @Input() showNotes: boolean = false;
  notes: string = '';

  constructor(private modalCtrl: ModalController) {}

  confirm() {
    this.modalCtrl.dismiss({ confirmed: true, notes: this.notes });
  }

  dismiss() {
    this.modalCtrl.dismiss({ confirmed: false });
  }
}
