import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DashboardStats } from '../../services/admin.service';
import { FleetService } from '../../services/fleet.service';
import { Aircraft, FleetStats } from '../../models/fleet.model';
import { BookingResponse } from '../../models/booking.model';
import { Flight } from '../../models/flight.model';
import { UserResponse } from '../../models/auth.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-wrapper">
      <!-- Global Operations Sidebar (Reference Images 1, 2 & 3) -->
      <aside class="ops-sidebar">
        <div class="brand-box">
          <span class="material-icons brand-icon">shield</span>
          <div>
            <h3>SkyFlow Admin</h3>
            <span class="sub">Global Operations</span>
          </div>
        </div>

        <button class="btn btn-primary new-route-btn">
          <span class="material-icons">add</span> + New Route
        </button>

        <nav class="sidebar-nav">
          <button [class.active]="activeNav === 'dashboard'" (click)="activeNav = 'dashboard'">
            <span class="material-icons">grid_view</span> Dashboard
          </button>

          <button [class.active]="activeNav === 'fleet'" (click)="activeNav = 'fleet'">
            <span class="material-icons">flight</span> Fleet Management
          </button>

          <button [class.active]="activeNav === 'routes'" (click)="activeNav = 'routes'">
            <span class="material-icons">map</span> Route Planner
          </button>

          <button [class.active]="activeNav === 'schedules'" (click)="activeNav = 'schedules'">
            <span class="material-icons">calendar_today</span> Schedules
          </button>

          <button [class.active]="activeNav === 'analytics'" (click)="activeNav = 'analytics'">
            <span class="material-icons">bar_chart</span> Analytics
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="footer-btn">
            <span class="material-icons">settings</span> Settings
          </button>
          <button class="footer-btn">
            <span class="material-icons">logout</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main Operations Content Area -->
      <main class="ops-main">
        <!-- 1. DASHBOARD VIEW (Reference Image 3) -->
        <ng-container *ngIf="activeNav === 'dashboard'">
          <header class="page-header">
            <div>
              <h2>Dashboard</h2>
              <p>Overview of today's global operations.</p>
            </div>
          </header>

          <div class="stats-cards-row">
            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">ACTIVE FLIGHTS</span>
                <span class="material-icons icon">flight</span>
              </div>
              <div class="value">342</div>
              <span class="trend positive">📈 +12% from yesterday</span>
            </div>

            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">ON-TIME PERFORMANCE</span>
                <span class="material-icons icon">schedule</span>
              </div>
              <div class="value">94.8%</div>
              <span class="trend positive">📈 +1.2% this week</span>
            </div>

            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">TOTAL REVENUE</span>
                <span class="material-icons icon">payments</span>
              </div>
              <div class="value">$2.4M</div>
              <span class="trend">Daily tracking metric</span>
            </div>
          </div>

          <!-- Recent Operations Table -->
          <div class="card content-table-card">
            <h3>Recent Operations</h3>
            <table class="ops-table">
              <thead>
                <tr>
                  <th>FLIGHT NO</th>
                  <th>ROUTE</th>
                  <th>AIRCRAFT ID</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SF-1042</strong></td>
                  <td>JFK → LHR</td>
                  <td>B787-9</td>
                  <td><span class="badge badge-operational">● On-time</span></td>
                  <td>...</td>
                </tr>
                <tr>
                  <td><strong>SF-0891</strong></td>
                  <td>SFO → NRT</td>
                  <td>A350-9</td>
                  <td><span class="badge badge-maintenance">● Delayed</span></td>
                  <td>...</td>
                </tr>
                <tr>
                  <td><strong>SF-2204</strong></td>
                  <td>DXB → CDG</td>
                  <td>B777-3</td>
                  <td><span class="badge badge-operational">● On-time</span></td>
                  <td>...</td>
                </tr>
                <tr>
                  <td><strong>SF-3110</strong></td>
                  <td>SYD → LAX</td>
                  <td>A380-8</td>
                  <td><span class="badge badge-operational">● On-time</span></td>
                  <td>...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- 2. FLEET MANAGEMENT VIEW (Reference Images 1 & 2) -->
        <ng-container *ngIf="activeNav === 'fleet'">
          <header class="page-header header-with-actions">
            <div>
              <h2>Fleet Management</h2>
              <p>Monitor and manage the active aircraft fleet.</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-outline">📥 Export Report</button>
              <button class="btn btn-primary">+ Add Aircraft</button>
            </div>
          </header>

          <!-- Fleet Metrics -->
          <div class="stats-cards-row" *ngIf="fleetStats">
            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">TOTAL AIRCRAFT</span>
                <span class="material-icons icon">flight_takeoff</span>
              </div>
              <div class="value">{{ fleetStats.totalAircraft }}</div>
              <span class="trend positive">📈 +2 this quarter</span>
            </div>

            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">OPERATIONAL</span>
                <span class="material-icons icon">check_circle</span>
              </div>
              <div class="value">{{ fleetStats.operationalCount }}</div>
              <span class="trend positive">{{ fleetStats.fleetReadiness }}% Fleet Readiness</span>
            </div>

            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">IN MAINTENANCE</span>
                <span class="material-icons icon">build</span>
              </div>
              <div class="value">{{ fleetStats.maintenanceCount }}</div>
              <span class="trend warning">2 scheduled, 2 unscheduled</span>
            </div>
          </div>

          <!-- Fleet Search & Filter Bar -->
          <div class="card content-table-card">
            <div class="table-filter-bar">
              <div class="search-input-box">
                <span class="material-icons">search</span>
                <input type="text" [(ngModel)]="fleetSearchQuery" placeholder="Search tail number or model..." />
              </div>
              <div class="status-filter">
                <span>Status:</span>
                <select [(ngModel)]="fleetStatusFilter">
                  <option value="ALL">All Statuses</option>
                  <option value="Operational">Operational</option>
                  <option value="In Maintenance">In Maintenance</option>
                </select>
              </div>
            </div>

            <!-- Fleet Table -->
            <table class="ops-table">
              <thead>
                <tr>
                  <th>TAIL NUMBER</th>
                  <th>MODEL</th>
                  <th>STATUS</th>
                  <th>LAST INSPECTION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let plane of filteredFleet">
                  <td><strong>✈ {{ plane.tailNumber }}</strong></td>
                  <td>{{ plane.model }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-operational': plane.status === 'Operational',
                      'badge-maintenance': plane.status === 'In Maintenance'
                    }">● {{ plane.status }}</span>
                  </td>
                  <td>{{ plane.lastInspection }}</td>
                  <td><button class="btn btn-outline btn-sm">Inspect</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- 3. ROUTE PLANNER / SCHEDULES / ANALYTICS -->
        <ng-container *ngIf="activeNav !== 'dashboard' && activeNav !== 'fleet'">
          <div class="card content-table-card placeholder-card">
            <h3>{{ activeNav | titlecase }} Module</h3>
            <p>System operational metrics and controls for {{ activeNav }}.</p>
          </div>
        </ng-container>
      </main>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: calc(100vh - 72px);
      background: var(--primary-bg);
    }
    .ops-sidebar {
      background: #0d162e;
      border-right: 1px solid var(--border-color);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px;

      h3 { font-size: 1.1rem; margin: 0; font-weight: 800; }
      .sub { font-size: 0.75rem; color: var(--text-muted); }
    }
    .brand-icon {
      font-size: 28px;
      color: var(--accent-color);
    }
    .new-route-btn {
      width: 100%;
      height: 44px;
      border-radius: 12px;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;

      button {
        display: flex;
        align-items: center;
        gap: 12px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 12px 16px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;

        &:hover, &.active {
          background: #182547;
          color: var(--accent-color);
        }
      }
    }
    .sidebar-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .footer-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      border: none;
      color: var(--text-dim);
      padding: 8px 12px;
      font-weight: 600;
      cursor: pointer;

      &:hover { color: var(--text-main); }
    }
    .ops-main {
      padding: 32px 40px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .page-header h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .page-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .header-with-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .stats-cards-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }
    .stat-widget {
      background: var(--surface-bg);
      padding: 24px;
      border-radius: 14px;
      border: 1px solid var(--border-color);
    }
    .stat-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); letter-spacing: 0.05em; }
      .icon { color: var(--accent-color); opacity: 0.7; }
    }
    .stat-widget .value {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .trend {
      font-size: 0.8rem;
      color: var(--text-muted);

      &.positive { color: var(--accent-color); }
      &.warning { color: #f59e0b; }
    }
    .content-table-card {
      background: var(--surface-bg);
      border-radius: 14px;
      padding: 28px;
    }
    .table-filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }
    .search-input-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #0f172a;
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 20px;
      width: 320px;

      input {
        background: transparent;
        border: none;
        color: white;
        width: 100%;
        &:focus { outline: none; }
      }
    }
    .status-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      span { font-size: 0.85rem; color: var(--text-muted); }
      select {
        background: #0f172a;
        color: white;
        border: 1px solid var(--border-color);
        padding: 6px 12px;
        border-radius: 8px;
      }
    }
    .ops-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 16px 20px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
      }
      th {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--text-dim);
        letter-spacing: 0.05em;
        background: #111a30;
      }
      td { font-size: 0.95rem; }
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    .placeholder-card {
      text-align: center;
      padding: 60px 24px;
    }
  `]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private fleetService = inject(FleetService);

  activeNav: 'dashboard' | 'fleet' | 'routes' | 'schedules' | 'analytics' = 'fleet';

  stats: DashboardStats | null = null;
  fleetStats: FleetStats | null = null;
  fleet: Aircraft[] = [];

  fleetSearchQuery = '';
  fleetStatusFilter = 'ALL';

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe(data => this.stats = data);
    this.fleetService.getFleet().subscribe(data => this.fleet = data);
    this.fleetService.getFleetStats().subscribe(data => this.fleetStats = data);
  }

  get filteredFleet(): Aircraft[] {
    return this.fleet.filter(plane => {
      const matchesSearch = plane.tailNumber.toLowerCase().includes(this.fleetSearchQuery.toLowerCase()) ||
                            plane.model.toLowerCase().includes(this.fleetSearchQuery.toLowerCase());
      const matchesStatus = this.fleetStatusFilter === 'ALL' || plane.status === this.fleetStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }
}
