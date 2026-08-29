import { Component, Input } from '@angular/core';

/** Shimmering placeholder block used while data loads. */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-block" [style.width]="width" [style.height]="height" [class.round]="round"></div>
  `,
  styles: [`
    .skeleton-block {
      background: linear-gradient(90deg, var(--surface-card) 25%, var(--border-color) 50%, var(--surface-card) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }
    .skeleton-block.round { border-radius: 50%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() round = false;
}
