import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h2>Welcome Back</h2>
        <p class="subtitle">Log in to manage your flight bookings.</p>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required email #emailCtrl="ngModel">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="btn btn-primary btn-block">
            {{ loading ? 'Logging in...' : 'Sign In' }}
          </button>
        </form>

        <div class="quick-credentials">
          <p><strong>Demo Accounts (Pre-loaded):</strong></p>
          <p>User: <code>priya&#64;example.com</code> / <code>Admin&#64;123</code></p>
          <p>Admin: <code>admin&#64;skyflow.com</code> / <code>Admin&#64;123</code></p>
        </div>

        <p class="footer-link">
          Don't have an account?
          <a [routerLink]="['/register']" [queryParams]="{ returnUrl: returnUrl }">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 24px;
      min-height: calc(100vh - 160px);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 36px;
    }
    .subtitle {
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .btn-block {
      width: 100%;
      margin-top: 12px;
    }
    .error-banner {
      background: #fee2e2;
      color: #991b1b;
      padding: 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
    .quick-credentials {
      background: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 0.85rem;
      color: var(--text-dark);
    }
    .footer-link {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9rem;

      a {
        color: var(--accent-color);
        font-weight: 600;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid email or password.';
        this.loading = false;
      }
    });
  }
}
