import { Component, OnInit } from '@angular/core';
import { OfflineSyncService } from '../../../services/offline-sync.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: false,
})
export class ChangePasswordPage implements OnInit {
  constructor(private offlineSync: OfflineSyncService) {}

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
  }
}
