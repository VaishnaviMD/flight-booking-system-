import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h2>Create an Account</h2>
        <p class="subtitle">Join SkyFlow to book and manage your flights.</p>

        <form (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="firstName" name="firstName" placeholder="John">
            </div>

            <div class="form-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="lastName" name="lastName" placeholder="Doe">
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="name@example.com">
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="9876543210">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="At least 6 characters">
          </div>

          <button type="submit" [disabled]="loading" class="btn btn-primary btn-block">
            {{ loading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <p class="footer-link">
          Already have an account?
          <a [routerLink]="['/login']" [queryParams]="{ returnUrl: returnUrl }">Log in here</a>
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
      max-width: 480px;
      padding: 36px;
    }
    .subtitle {
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  loading = false;
  errorMessage = '';
  returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  onSubmit() {
    this.errorMessage = '';

    if (!this.firstName || !this.firstName.trim()) {
      this.errorMessage = 'Please enter your first name.';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

    if (!this.lastName || !this.lastName.trim()) {
      this.errorMessage = 'Please enter your last name.';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

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

    if (this.phone && this.phone.trim() && !/^\+?[0-9\s\-()]{7,15}$/.test(this.phone.trim())) {
      this.errorMessage = 'Please enter a valid phone number.';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      this.toast.warning(this.errorMessage);
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.register({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      phone: this.phone ? this.phone.trim() : '',
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.success('Registration successful! Please sign in with your email and password.');
        this.router.navigate(['/login'], {
          queryParams: { email: this.email.trim(), registered: 'true' }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || (err.status === 0 ? 'Cannot reach the backend server. Please make sure port 8080 is running.' : 'Registration failed. Please check the form and try again.');
        this.toast.error(this.errorMessage);
        this.cdr.detectChanges();
      }
    });
  }
}
