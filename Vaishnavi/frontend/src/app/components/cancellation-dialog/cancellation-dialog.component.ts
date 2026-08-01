import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancellation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-title">
            <span class="material-icons warning-icon">warning</span>
            <h3>Confirm Flight Cancellation</h3>
          </div>
          <button (click)="close()" class="close-btn">✕</button>
        </header>

        <main class="modal-body">
          <p class="summary-text">
            Are you sure you want to cancel your booking for <strong>PNR: {{ pnr }}</strong>?
          </p>

          <div class="refund-estimate-box">
            <span class="label">REFUND ESTIMATION SUMMARY</span>
            <div class="row">
              <span>Original Ticket Fare:</span>
              <strong>₹{{ totalPrice }}</strong>
            </div>
            <div class="row">
              <span>Airline Cancellation Fee (20%):</span>
              <span class="fee-text">-₹{{ Math.round(totalPrice * 0.2) }}</span>
            </div>
            <div class="row total-refund">
              <span>Estimated Refund to Original Payment:</span>
              <strong class="refund-green">₹{{ Math.round(totalPrice * 0.8) }}</strong>
            </div>
          </div>

          <p class="policy-note">
            ℹ Refunds are processed back to your original payment method within 3–5 business days.
          </p>
        </main>

        <footer class="modal-footer">
          <button (click)="close()" class="btn btn-outline">Keep Booking</button>
          <button (click)="confirmCancel()" class="btn btn-danger">Confirm Cancellation</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .modal-card {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 480px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      padding: 20px 24px;
      background: #111a30;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      h3 { font-size: 1.15rem; margin: 0; font-weight: 800; }
    }
    .warning-icon { color: #f59e0b; }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 1.2rem;
      cursor: pointer;

      &:hover { color: white; }
    }
    .modal-body {
      padding: 24px;
    }
    .summary-text {
      font-size: 0.95rem;
      color: var(--text-main);
      margin-bottom: 20px;
    }
    .refund-estimate-box {
      background: #0f172a;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;

      .label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-dim); margin-bottom: 12px; }
      .row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; color: var(--text-muted); }
      .fee-text { color: #ef4444; }
      .total-refund { border-top: 1px dashed var(--border-color); padding-top: 10px; margin-bottom: 0; color: var(--text-main); font-size: 1rem; }
      .refund-green { color: var(--accent-color); font-size: 1.1rem; }
    }
    .policy-note {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .modal-footer {
      padding: 16px 24px;
      background: #111a30;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class CancellationDialogComponent {
  @Input() isOpen = false;
  @Input() pnr = '';
  @Input() totalPrice = 0;

  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  Math = Math;

  close() {
    this.closed.emit();
  }

  confirmCancel() {
    this.confirmed.emit();
  }
}
