import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="status-badge" [class]="statusClass">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 100px;
      white-space: nowrap;
    }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-present { background: #d1fae5; color: #065f46; }
    .status-late { background: #fef3c7; color: #92400e; }
    .status-absent { background: #fee2e2; color: #991b1b; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-cancelled { background: #f1f0ee; color: #94a3b8; }
    @media (prefers-color-scheme: dark) {
      .status-pending { background: #451a03; color: #fbbf24; }
      .status-approved { background: #064e3b; color: #6ee7b7; }
      .status-rejected { background: #7f1d1d; color: #fca5a5; }
      .status-present { background: #064e3b; color: #6ee7b7; }
      .status-late { background: #451a03; color: #fbbf24; }
      .status-absent { background: #7f1d1d; color: #fca5a5; }
      .status-paid { background: #064e3b; color: #6ee7b7; }
      .status-cancelled { background: #334155; color: #94a3b8; }
    }
  `],
  standalone: false,
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get label(): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Absen',
      paid: 'Dibayar',
      cancelled: 'Dibatalkan',
    };
    return labels[this.status] || this.status;
  }

  get statusClass(): string {
    return `status-${this.status}`;
  }
}
