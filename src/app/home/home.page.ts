import { Component } from '@angular/core';
import { OfflineSyncService } from '../services/offline-sync.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private offlineSync: OfflineSyncService) {}

  ionViewWillEnter(): void {
    void this.offlineSync.syncWhenOnline();
  }

}
