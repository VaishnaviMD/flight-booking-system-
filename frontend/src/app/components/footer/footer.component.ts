import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <h3>SkyFlow</h3>
          <p>Seamless flight booking system connected with Spring Boot & PostgreSQL.</p>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2026 SkyFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--primary-color);
      color: #94a3b8;
      padding: 40px 0 20px;
      margin-top: auto;
    }
    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }
    .footer-brand h3 {
      color: #ffffff;
      margin-bottom: 8px;
    }
    .footer-copyright {
      border-top: 1px solid #334155;
      width: 100%;
      padding-top: 16px;
      font-size: 0.85rem;
    }
  `]
})
export class FooterComponent {}
