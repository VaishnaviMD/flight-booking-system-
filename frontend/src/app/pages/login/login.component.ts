import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h2>Welcome Back</h2>
        <p class="subtitle">Log in to manage your flight bookings.</p>

        <form (ngSubmit)="onSubmit()">
          <div *ngIf="successMessage" class="success-banner">
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="name@example.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="loading" class="btn btn-primary btn-block">
            {{ loading ? 'Logging in...' : 'Sign In' }}
          </button>
        </form>

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
    .success-banner {
      background: rgba(0, 220, 130, 0.15);
      border: 1px solid var(--accent-color);
      color: var(--accent-color);
      padding: 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .error-banner {
      background: #fee2e2;
      color: #991b1b;
      padding: 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .footer-link {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;

      a {
        color: var(--accent-color);
        font-weight: 600;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '/';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl'] && params['returnUrl'] !== '/login' && params['returnUrl'] !== '/register') {
        this.returnUrl = params['returnUrl'];
      }
      if (params['email']) {
        this.email = params['email'];
      }
      if (params['registered'] === 'true') {
        this.successMessage = 'Registration successful! Please enter your password to sign in.';
      }
      this.cdr.detectChanges();
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address (e.g. name@example.com).';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

    if (!this.password || !this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.success(`Welcome back, ${res.firstName || 'Traveller'}!`);
        const target = (this.returnUrl && this.returnUrl !== '/login' && this.returnUrl !== '/register' && this.returnUrl !== '') ? this.returnUrl : '/';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || (err.status === 0 ? 'Cannot reach the backend server. Please make sure port 8080 is running.' : 'Invalid email or password. Please check your credentials.');
        this.toast.error(this.errorMessage);
        this.cdr.detectChanges();
      }
    });
  }
}
