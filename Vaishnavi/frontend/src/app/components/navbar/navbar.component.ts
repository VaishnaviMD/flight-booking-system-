import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="brand">
          <span class="material-icons brand-icon">flight_takeoff</span>
          <span class="brand-name">SkyFlow</span>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/search" routerLinkActive="active">Search Flights</a>
          <a routerLink="/assistant" routerLinkActive="active" class="ai-nav-link">
            <span class="material-icons ai-icon">smart_toy</span> AI Guide
          </a>
          <a *ngIf="authService.isLoggedIn()" routerLink="/my-bookings" routerLinkActive="active">My Bookings</a>
          <a *ngIf="authService.isLoggedIn()" routerLink="/flights/my-trips" routerLinkActive="active">My Trips</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active" class="admin-badge">Admin Ops</a>
        </div>

        <div class="auth-actions">
          <!-- Dark / Light Theme Toggle Button -->
          <button (click)="themeService.toggleTheme()" class="theme-toggle-btn" [title]="'Switch to ' + (themeService.isDark() ? 'Light' : 'Dark') + ' Mode'">
            <span class="material-icons">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <ng-container *ngIf="!authService.isLoggedIn(); else userMenu">
            <a routerLink="/login" class="btn btn-outline">Log In</a>
            <a routerLink="/register" class="btn btn-primary">Sign Up</a>
          </ng-container>

          <ng-template #userMenu>
            <div class="user-profile">
              <span class="user-greeting">Hi, {{ authService.currentUser()?.firstName }}</span>
              <button (click)="logout()" class="btn btn-outline btn-sm">Log Out</button>
            </div>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--header-bg);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: background 0.3s ease;
    }
    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .brand-icon {
      color: var(--accent-color);
      font-size: 32px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;

      a {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--text-muted);
        transition: color 0.2s;

        &:hover, &.active {
          color: var(--accent-color);
        }
      }
    }
    .ai-nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--accent-color) !important;
    }
    .ai-icon {
      font-size: 20px;
    }
    .admin-badge {
      background: rgba(0, 220, 130, 0.15);
      color: #00b86b !important;
      padding: 4px 12px;
      border-radius: 6px;
      border: 1px solid rgba(0, 220, 130, 0.3);
    }
    .auth-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .theme-toggle-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--border-color);
        color: var(--accent-color);
      }
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-greeting {
      font-weight: 600;
      color: var(--text-main);
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
