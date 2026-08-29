import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite">
      <div *ngFor="let t of toastService.toasts()" class="toast-item" [ngClass]="'toast-' + t.type">
        <span class="material-icons toast-icon">{{ iconFor(t.type) }}</span>
        <span class="toast-text">{{ t.message }}</span>
        <button class="toast-close" (click)="toastService.dismiss(t.id)" aria-label="Dismiss">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 84px;
      right: 20px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
    }
    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 10px;
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow);
      color: var(--text-main);
      font-size: 0.88rem;
      animation: toast-in 0.25s ease;
    }
    .toast-icon { font-size: 18px; }
    .toast-success .toast-icon { color: var(--accent-color); }
    .toast-error { border-left: 3px solid #ef4444; }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning { border-left: 3px solid #f59e0b; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info .toast-icon { color: var(--accent-color); }
    .toast-text { flex: 1; }
    .toast-close { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 0.8rem; }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(12px); }
      to { opacity: 1; transform: none; }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}
