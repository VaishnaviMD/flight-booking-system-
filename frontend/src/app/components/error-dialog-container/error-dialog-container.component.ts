import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorDialogService } from '../../services/error-dialog.service';

@Component({
  selector: 'app-error-dialog-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="errorDialog.current() as data" (click)="errorDialog.close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-title">
            <span class="material-icons error-icon">report</span>
            <h3>{{ data.title }}</h3>
          </div>
          <button (click)="errorDialog.close()" class="close-btn">✕</button>
        </header>
        <main class="modal-body">
          <p>{{ data.message }}</p>
        </main>
        <footer class="modal-footer">
          <button (click)="errorDialog.close()" class="btn btn-primary">OK</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2500;
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
      max-width: 420px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }
    .modal-header {
      padding: 18px 22px;
      background: #111a30;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-title { display: flex; align-items: center; gap: 10px; h3 { font-size: 1.05rem; margin: 0; } }
    .error-icon { color: #ef4444; }
    .close-btn { background: transparent; border: none; color: var(--text-dim); cursor: pointer; &:hover { color: white; } }
    .modal-body {
      padding: 22px;
      p { color: var(--text-muted); font-size: 0.92rem; line-height: 1.5; }
    }
    .modal-footer {
      padding: 14px 22px;
      background: #111a30;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ErrorDialogContainerComponent {
  errorDialog = inject(ErrorDialogService);
}
