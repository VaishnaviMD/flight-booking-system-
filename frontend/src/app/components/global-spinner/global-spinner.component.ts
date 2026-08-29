import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-overlay" *ngIf="loading.isLoading()">
      <div class="plane-spinner">
        <span class="material-icons plane-icon">flight_takeoff</span>
      </div>
      <p>Loading…</p>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.55);
      backdrop-filter: blur(2px);
      z-index: 4000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .plane-spinner {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: spin 1s linear infinite;
    }
    .plane-icon { color: var(--accent-color); font-size: 26px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class GlobalSpinnerComponent {
  loading = inject(LoadingService);
}
