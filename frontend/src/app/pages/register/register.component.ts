import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h2>Create an Account</h2>
        <p class="subtitle">Join SkyFlow to book and manage your flights.</p>

        <form (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="firstName" name="firstName" required>
            </div>

            <div class="form-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="lastName" name="lastName" required>
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required email>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" [(ngModel)]="phone" name="phone">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6">
          </div>

          <button type="submit" [disabled]="regForm.invalid || loading" class="btn btn-primary btn-block">
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  loading = false;
  errorMessage = '';
  returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}
