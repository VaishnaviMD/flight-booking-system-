import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, DashboardStats } from '../../services/admin.service';
import { FleetService } from '../../services/fleet.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
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
      <!-- Global Operations Sidebar -->
      <aside class="ops-sidebar">
        <div class="brand-box">
          <span class="material-icons brand-icon">shield</span>
          <div>
            <h3>SkyFlow Admin</h3>
            <span class="sub">Global Operations</span>
          </div>
        </div>

        <button (click)="openNewRouteModal()" class="btn btn-primary new-route-btn">
          <span class="material-icons">add</span> + New Flight / Route
        </button>

        <nav class="sidebar-nav">
          <button [class.active]="activeNav === 'dashboard'" (click)="activeNav = 'dashboard'">
            <span class="material-icons">grid_view</span> Dashboard
          </button>

          <button [class.active]="activeNav === 'fleet'" (click)="activeNav = 'fleet'">
            <span class="material-icons">flight</span> Fleet Management
          </button>

          <button [class.active]="activeNav === 'routes'" (click)="activeNav = 'routes'">
            <span class="material-icons">map</span> Route & Flight Ops
          </button>

          <button [class.active]="activeNav === 'schedules'" (click)="activeNav = 'schedules'">
            <span class="material-icons">calendar_today</span> Customer Bookings
          </button>

          <button [class.active]="activeNav === 'analytics'" (click)="activeNav = 'analytics'">
            <span class="material-icons">people</span> Registered Users
          </button>
        </nav>

        <div class="sidebar-footer">
          <button (click)="openSettingsModal()" class="footer-btn">
            <span class="material-icons">settings</span> System Status
          </button>
          <button (click)="logout()" class="footer-btn">
            <span class="material-icons">logout</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main Operations Content Area -->
      <main class="ops-main">

        <!-- 1. DASHBOARD VIEW -->
        <ng-container *ngIf="activeNav === 'dashboard'">
          <header class="page-header header-with-actions">
            <div>
              <h2>Global Operations Dashboard</h2>
              <p>Real-time system overview and operational metrics.</p>
            </div>
            <div class="header-actions">
              <button (click)="refreshAllData()" class="btn btn-outline">
                <span class="material-icons">refresh</span> Refresh Data
              </button>
            </div>
          </header>

          <div class="stats-cards-row">
            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">ACTIVE FLIGHTS</span>
                <span class="material-icons icon">flight</span>
              </div>
              <div class="value">{{ stats?.totalFlights ?? 0 }}</div>
              <span class="trend positive">📈 {{ stats?.scheduledFlights ?? 0 }} currently scheduled</span>
            </div>

            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">CONFIRMED BOOKINGS</span>
                <span class="material-icons icon">confirmation_number</span>
              </div>
              <div class="value">{{ stats?.confirmedBookings ?? 0 }}</div>
              <span class="trend positive">Total {{ stats?.totalBookings ?? 0 }} reservations</span>
            </div>

            <div class="card stat-widget">
              <div class="stat-top">
                <span class="label">TOTAL REVENUE</span>
                <span class="material-icons icon">payments</span>
              </div>
              <div class="value">₹{{ (stats?.totalRevenue ?? 0) | number:'1.2-2' }}</div>
              <span class="trend positive">Live ticket transaction gross</span>
            </div>

            <div class="card stat-widget" *ngIf="fleetStats">
              <div class="stat-top">
                <span class="label">FLEET READINESS</span>
                <span class="material-icons icon">check_circle</span>
              </div>
              <div class="value">{{ fleetStats.fleetReadiness }}%</div>
              <span class="trend">{{ fleetStats.operationalCount }} of {{ fleetStats.totalAircraft }} aircraft ready</span>
            </div>
          </div>

          <!-- Live Scheduled Flights Table -->
          <div class="card content-table-card">
            <div class="card-head-row">
              <h3>Live Scheduled Flights</h3>
              <button (click)="activeNav = 'routes'" class="btn btn-outline btn-sm">Manage All Flights →</button>
            </div>
            <table class="ops-table">
              <thead>
                <tr>
                  <th>FLIGHT NO</th>
                  <th>AIRLINE</th>
                  <th>ROUTE</th>
                  <th>DEPARTURE</th>
                  <th>FARE</th>
                  <th>AVAILABLE SEATS</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of flights.slice(0, 6)">
                  <td><strong>{{ f.flightNumber }}</strong></td>
                  <td>{{ f.airline?.name }}</td>
                  <td>{{ f.originAirport?.code }} ➔ {{ f.destinationAirport?.code }}</td>
                  <td>{{ f.departureTime | date:'short' }}</td>
                  <td><strong>₹{{ f.basePrice }}</strong></td>
                  <td>{{ f.availableSeats }} seats</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-operational': f.status === 'SCHEDULED',
                      'badge-maintenance': f.status === 'DELAYED' || f.status === 'CANCELLED'
                    }">● {{ f.status }}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button (click)="changeFlightStatus(f)" class="btn btn-outline btn-xs" title="Change flight status">Status</button>
                      <button (click)="deleteFlight(f.id)" class="btn btn-danger btn-xs" title="Delete flight">×</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="flights.length === 0">
                  <td colspan="8" style="text-align:center; color: var(--text-dim); padding: 24px;">No flights currently loaded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- 2. FLEET MANAGEMENT VIEW -->
        <ng-container *ngIf="activeNav === 'fleet'">
          <header class="page-header header-with-actions">
            <div>
              <h2>Fleet Management</h2>
              <p>Monitor aircraft status, maintenance records, and operational readiness.</p>
            </div>
            <div class="header-actions">
              <button (click)="exportFleetReport()" class="btn btn-outline">📥 Export Fleet CSV</button>
              <button (click)="openAddAircraftModal()" class="btn btn-primary">+ Add Aircraft</button>
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
              <span class="trend positive">Active fleet tracking</span>
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
              <span class="trend warning">Scheduled hangar inspection</span>
            </div>
          </div>

          <!-- Fleet Table & Search -->
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

            <table class="ops-table">
              <thead>
                <tr>
                  <th>TAIL NUMBER</th>
                  <th>MODEL</th>
                  <th>STATUS</th>
                  <th>LAST INSPECTION</th>
                  <th>HOURS FLOWN</th>
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
                  <td>{{ plane.totalHoursFlown }} hrs</td>
                  <td>
                    <button (click)="toggleAircraftStatus(plane.id)" class="btn btn-outline btn-sm">
                      {{ plane.status === 'Operational' ? 'Set Maintenance' : 'Set Operational' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- 3. ROUTE & FLIGHT OPS VIEW -->
        <ng-container *ngIf="activeNav === 'routes'">
          <header class="page-header header-with-actions">
            <div>
              <h2>Route & Flight Operations</h2>
              <p>Add new scheduled flights, modify flight statuses, and manage routes.</p>
            </div>
            <div class="header-actions">
              <button (click)="openNewRouteModal()" class="btn btn-primary">+ Add New Flight</button>
            </div>
          </header>

          <div class="card content-table-card">
            <div class="table-filter-bar">
              <div class="search-input-box">
                <span class="material-icons">search</span>
                <input type="text" [(ngModel)]="flightSearchQuery" placeholder="Search flight no, city, airline..." />
              </div>
              <div class="status-filter">
                <span>Cabin:</span>
                <select [(ngModel)]="flightCabinFilter">
                  <option value="ALL">All Cabins</option>
                  <option value="ECONOMY">Economy</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>
            </div>

            <table class="ops-table">
              <thead>
                <tr>
                  <th>FLIGHT NO</th>
                  <th>AIRLINE</th>
                  <th>ROUTE</th>
                  <th>DEPARTURE</th>
                  <th>ARRIVAL</th>
                  <th>BASE FARE</th>
                  <th>AVAILABLE SEATS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of filteredFlights">
                  <td><strong>{{ f.flightNumber }}</strong></td>
                  <td>{{ f.airline?.name }}</td>
                  <td>{{ f.originAirport?.code }} ({{ f.originAirport?.city }}) ➔ {{ f.destinationAirport?.code }} ({{ f.destinationAirport?.city }})</td>
                  <td>{{ f.departureTime | date:'short' }}</td>
                  <td>{{ f.arrivalTime | date:'short' }}</td>
                  <td><strong>₹{{ f.basePrice }}</strong></td>
                  <td>{{ f.availableSeats }} seats</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-operational': f.status === 'SCHEDULED',
                      'badge-maintenance': f.status === 'DELAYED' || f.status === 'CANCELLED'
                    }">● {{ f.status }}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button (click)="changeFlightStatus(f)" class="btn btn-outline btn-xs">Change Status</button>
                      <button (click)="deleteFlight(f.id)" class="btn btn-danger btn-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- 4. CUSTOMER BOOKINGS VIEW -->
        <ng-container *ngIf="activeNav === 'schedules'">
          <header class="page-header">
            <div>
              <h2>Customer Reservations & Bookings</h2>
              <p>System-wide confirmed, pending, and cancelled bookings.</p>
            </div>
          </header>

          <div class="card content-table-card">
            <div class="table-filter-bar">
              <div class="search-input-box">
                <span class="material-icons">search</span>
                <input type="text" [(ngModel)]="bookingSearchQuery" placeholder="Search PNR, flight, customer..." />
              </div>
            </div>

            <table class="ops-table">
              <thead>
                <tr>
                  <th>BOOKING ID</th>
                  <th>PNR CODE</th>
                  <th>ROUTE</th>
                  <th>FLIGHT NO</th>
                  <th>PASSENGERS</th>
                  <th>TOTAL AMOUNT</th>
                  <th>STATUS</th>
                  <th>BOOKED AT</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of filteredBookings">
                  <td>#{{ b.id }}</td>
                  <td><strong style="color: var(--accent-color);">{{ b.pnr }}</strong></td>
                  <td>{{ b.flight?.originAirport?.code ?? 'DEL' }} ➔ {{ b.flight?.destinationAirport?.code ?? 'BOM' }}</td>
                  <td>{{ b.flight?.flightNumber ?? 'N/A' }}</td>
                  <td>{{ b.passengers?.length ?? 1 }} Passenger(s)</td>
                  <td><strong>₹{{ b.totalPrice ?? b.totalAmount }}</strong></td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-operational': b.status === 'CONFIRMED',
                      'badge-maintenance': b.status === 'CANCELLED'
                    }">● {{ b.status }}</span>
                  </td>
                  <td>{{ (b.bookedAt ?? b.createdAt) | date:'short' }}</td>
                </tr>
                <tr *ngIf="filteredBookings.length === 0">
                  <td colspan="8" style="text-align:center; color: var(--text-dim); padding: 32px;">No bookings found matching query.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

        <!-- 5. REGISTERED USERS VIEW -->
        <ng-container *ngIf="activeNav === 'analytics'">
          <header class="page-header">
            <div>
              <h2>Registered Users & Role Management</h2>
              <p>Registered accounts in the database.</p>
            </div>
          </header>

          <div class="card content-table-card">
            <table class="ops-table">
              <thead>
                <tr>
                  <th>USER ID</th>
                  <th>NAME</th>
                  <th>EMAIL ADDRESS</th>
                  <th>PHONE</th>
                  <th>SYSTEM ROLE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users">
                  <td>#{{ u.id }}</td>
                  <td><strong>{{ u.firstName }} {{ u.lastName }}</strong></td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.phone || '—' }}</td>
                  <td>
                    <span class="badge" [ngClass]="u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'">
                      {{ u.role }}
                    </span>
                  </td>
                  <td><span class="badge badge-operational">● Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

      </main>
    </div>

    <!-- MODAL 1: CREATE NEW FLIGHT / ROUTE -->
    <div class="modal-overlay" *ngIf="showNewRouteModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Create New Flight Route</h3>
          <button (click)="showNewRouteModal = false" class="close-btn">&times;</button>
        </div>
        <form (ngSubmit)="submitCreateFlight()" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Flight Number</label>
              <input type="text" [(ngModel)]="newFlight.flightNumber" name="flightNumber" placeholder="e.g. 6E-2055" required />
            </div>
            <div class="form-group">
              <label>Airline</label>
              <select [(ngModel)]="newFlight.airlineCode" name="airlineCode">
                <option value="6E">IndiGo (6E)</option>
                <option value="AI">Air India (AI)</option>
                <option value="SG">SpiceJet (SG)</option>
                <option value="UK">Vistara (UK)</option>
                <option value="QP">Akasa Air (QP)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Origin Airport</label>
              <select [(ngModel)]="newFlight.originCode" name="originCode">
                <option value="DEL">Delhi (DEL)</option>
                <option value="BOM">Mumbai (BOM)</option>
                <option value="BLR">Bengaluru (BLR)</option>
                <option value="MAA">Chennai (MAA)</option>
                <option value="HYD">Hyderabad (HYD)</option>
                <option value="CCU">Kolkata (CCU)</option>
                <option value="GOI">Goa (GOI)</option>
                <option value="COK">Kochi (COK)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Destination Airport</label>
              <select [(ngModel)]="newFlight.destinationCode" name="destinationCode">
                <option value="BOM">Mumbai (BOM)</option>
                <option value="DEL">Delhi (DEL)</option>
                <option value="BLR">Bengaluru (BLR)</option>
                <option value="MAA">Chennai (MAA)</option>
                <option value="HYD">Hyderabad (HYD)</option>
                <option value="CCU">Kolkata (CCU)</option>
                <option value="GOI">Goa (GOI)</option>
                <option value="COK">Kochi (COK)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Base Price (₹)</label>
              <input type="number" [(ngModel)]="newFlight.basePrice" name="basePrice" placeholder="4500" required />
            </div>
            <div class="form-group">
              <label>Total Seats</label>
              <input type="number" [(ngModel)]="newFlight.totalSeats" name="totalSeats" placeholder="180" />
            </div>
            <div class="form-group">
              <label>Cabin Class</label>
              <select [(ngModel)]="newFlight.cabinClass" name="cabinClass">
                <option value="ECONOMY">Economy Class</option>
                <option value="BUSINESS">Business Class</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" (click)="showNewRouteModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Publish Flight</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: ADD AIRCRAFT TO FLEET -->
    <div class="modal-overlay" *ngIf="showAddAircraftModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Add Aircraft to Fleet</h3>
          <button (click)="showAddAircraftModal = false" class="close-btn">&times;</button>
        </div>
        <form (ngSubmit)="submitAddAircraft()" class="modal-form">
          <div class="form-group">
            <label>Tail Number</label>
            <input type="text" [(ngModel)]="newAircraft.tailNumber" name="tailNumber" placeholder="e.g. VT-SKY" required />
          </div>
          <div class="form-group">
            <label>Aircraft Model</label>
            <select [(ngModel)]="newAircraft.model" name="model">
              <option value="Airbus A320neo">Airbus A320neo</option>
              <option value="Airbus A321neo">Airbus A321neo</option>
              <option value="Boeing 737 MAX 8">Boeing 737 MAX 8</option>
              <option value="Boeing 787-9 Dreamliner">Boeing 787-9 Dreamliner</option>
              <option value="Airbus A350-900">Airbus A350-900</option>
            </select>
          </div>
          <div class="form-group">
            <label>Initial Status</label>
            <select [(ngModel)]="newAircraft.status" name="status">
              <option value="Operational">Operational</option>
              <option value="In Maintenance">In Maintenance</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" (click)="showAddAircraftModal = false" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary">Register Aircraft</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: SYSTEM STATUS & CONFIG -->
    <div class="modal-overlay" *ngIf="showSettingsModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>SkyFlow System Information</h3>
          <button (click)="showSettingsModal = false" class="close-btn">&times;</button>
        </div>
        <div class="system-info-body">
          <div class="info-row">
            <span>Spring Boot Backend:</span>
            <strong style="color: #00dc82;">● Online (Port 8080)</strong>
          </div>
          <div class="info-row">
            <span>PostgreSQL Database:</span>
            <strong style="color: #00dc82;">● Connected (Port 5432)</strong>
          </div>
          <div class="info-row">
            <span>Ollama AI Runtime:</span>
            <strong style="color: #38bdf8;">● Active (llama3.2:1b)</strong>
          </div>
          <div class="info-row">
            <span>Model Context Protocol (MCP):</span>
            <strong style="color: #38bdf8;">● 5 Database Tools Mounted</strong>
          </div>
          <div class="info-row">
            <span>Admin Session:</span>
            <strong>{{ authService.currentUser()?.email }} ({{ authService.currentUser()?.role }})</strong>
          </div>
        </div>
        <div class="modal-actions">
          <button (click)="showSettingsModal = false" class="btn btn-primary btn-block">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: flex;
      min-height: calc(100vh - 72px);
      background: var(--bg-color, #0b1120);
      color: var(--text-main, #f8fafc);
    }
    .ops-sidebar {
      width: 280px;
      background: var(--header-bg, #0f172a);
      border-right: 1px solid var(--border-color, #1e293b);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex-shrink: 0;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px 16px;
      border-bottom: 1px solid var(--border-color);
      .brand-icon { font-size: 32px; color: var(--accent-color, #00dc82); }
      h3 { font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-main); }
      .sub { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
    }
    .new-route-btn {
      width: 100%;
      justify-content: center;
      gap: 6px;
      font-weight: 700;
      padding: 12px;
      border-radius: 8px;
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
        color: var(--text-muted, #94a3b8);
        padding: 12px 14px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
        &.active {
          background: rgba(0, 220, 130, 0.12);
          color: var(--accent-color, #00dc82);
          font-weight: 700;
        }
      }
    }
    .sidebar-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .footer-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: none;
        color: var(--text-dim, #64748b);
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
      }
    }
    .ops-main {
      flex: 1;
      padding: 32px 40px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      overflow-y: auto;
    }
    .page-header {
      h2 { font-size: 1.8rem; font-weight: 800; margin: 0 0 6px; }
      p { color: var(--text-muted); font-size: 0.95rem; margin: 0; }
      &.header-with-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .stats-cards-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .stat-widget {
      background: var(--surface-bg, #111a30);
      padding: 22px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .stat-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); letter-spacing: 0.05em; }
      .icon { color: var(--accent-color, #00dc82); opacity: 0.8; font-size: 22px; }
    }
    .stat-widget .value {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 6px;
      color: var(--text-main);
    }
    .trend {
      font-size: 0.8rem;
      color: var(--text-muted);
      &.positive { color: var(--accent-color, #00dc82); }
      &.warning { color: #f59e0b; }
    }
    .content-table-card {
      background: var(--surface-bg, #111a30);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid var(--border-color);
    }
    .card-head-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      h3 { margin: 0; font-size: 1.2rem; font-weight: 700; }
    }
    .table-filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
    }
    .search-input-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-color, #0b1120);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 20px;
      width: 320px;

      input {
        background: transparent;
        border: none;
        color: var(--text-main);
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
        background: var(--bg-color, #0b1120);
        color: var(--text-main);
        border: 1px solid var(--border-color);
        padding: 6px 12px;
        border-radius: 8px;
      }
    }
    .ops-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
      }
      th {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--text-dim);
        letter-spacing: 0.05em;
        background: rgba(0, 0, 0, 0.2);
      }
      td { font-size: 0.9rem; color: var(--text-main); }
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;

      &.badge-operational {
        background: rgba(0, 220, 130, 0.15);
        color: #00dc82;
      }
      &.badge-maintenance {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }
      &.badge-admin {
        background: rgba(37, 99, 235, 0.2);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.4);
      }
      &.badge-user {
        background: rgba(148, 163, 184, 0.15);
        color: #94a3b8;
      }
    }
    .btn-xs {
      padding: 4px 8px;
      font-size: 0.75rem;
      border-radius: 4px;
    }
    .btn-danger {
      background: #ef4444;
      color: white;
      border: none;
      cursor: pointer;
      &:hover { background: #dc2626; }
    }

    /* Modal Overlay & Card */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
    }
    .modal-card {
      background: var(--surface-bg, #111a30);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      width: 100%;
      max-width: 540px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      h3 { margin: 0; font-size: 1.3rem; font-weight: 800; }
      .close-btn {
        background: none; border: none; font-size: 24px; color: var(--text-dim);
        cursor: pointer; &:hover { color: var(--text-main); }
      }
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
      input, select {
        background: var(--bg-color, #0b1120);
        border: 1px solid var(--border-color);
        padding: 10px 12px;
        border-radius: 8px;
        color: var(--text-main);
        font-size: 0.9rem;
        &:focus { outline: 1px solid var(--accent-color); }
      }
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
    .system-info-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px 0 20px;
      .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.95rem;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);
        span { color: var(--text-muted); }
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private fleetService = inject(FleetService);
  authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  activeNav: 'dashboard' | 'fleet' | 'routes' | 'schedules' | 'analytics' = 'dashboard';

  stats: DashboardStats | null = null;
  fleetStats: FleetStats | null = null;
  fleet: Aircraft[] = [];
  flights: Flight[] = [];
  bookings: BookingResponse[] = [];
  users: UserResponse[] = [];

  fleetSearchQuery = '';
  fleetStatusFilter = 'ALL';

  flightSearchQuery = '';
  flightCabinFilter = 'ALL';

  bookingSearchQuery = '';

  // Modals
  showNewRouteModal = false;
  showAddAircraftModal = false;
  showSettingsModal = false;

  newFlight: any = {
    flightNumber: '',
    airlineCode: '6E',
    originCode: 'DEL',
    destinationCode: 'BOM',
    basePrice: 4899,
    totalSeats: 180,
    cabinClass: 'ECONOMY'
  };

  newAircraft: Partial<Aircraft> = {
    tailNumber: '',
    model: 'Airbus A320neo',
    status: 'Operational'
  };

  ngOnInit() {
    this.refreshAllData();
  }

  refreshAllData() {
    this.adminService.getDashboardStats().subscribe({
      next: (d) => { this.stats = d; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.adminService.getAllFlights().subscribe({
      next: (d) => { this.flights = d; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.adminService.getAllBookings().subscribe({
      next: (d) => { this.bookings = d; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.adminService.getAllUsers().subscribe({
      next: (d) => { this.users = d; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.fleetService.getFleet().subscribe({
      next: (d) => { this.fleet = d; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.fleetService.getFleetStats().subscribe({
      next: (d) => { this.fleetStats = d; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  get filteredFleet(): Aircraft[] {
    return this.fleet.filter(plane => {
      const q = this.fleetSearchQuery.toLowerCase();
      const matchesSearch = plane.tailNumber.toLowerCase().includes(q) ||
                            plane.model.toLowerCase().includes(q);
      const matchesStatus = this.fleetStatusFilter === 'ALL' || plane.status === this.fleetStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get filteredFlights(): Flight[] {
    return this.flights.filter(f => {
      const q = this.flightSearchQuery.toLowerCase();
      const matchesSearch = f.flightNumber.toLowerCase().includes(q) ||
                            (f.airline?.name ?? '').toLowerCase().includes(q) ||
                            (f.originAirport?.city ?? '').toLowerCase().includes(q) ||
                            (f.destinationAirport?.city ?? '').toLowerCase().includes(q);
      const matchesCabin = this.flightCabinFilter === 'ALL' || f.cabinClass === this.flightCabinFilter;
      return matchesSearch && matchesCabin;
    });
  }

  get filteredBookings(): BookingResponse[] {
    return this.bookings.filter(b => {
      const q = this.bookingSearchQuery.toLowerCase();
      const pnr = (b.pnr ?? '').toLowerCase();
      const flightNo = (b.flight?.flightNumber ?? '').toLowerCase();
      return pnr.includes(q) || flightNo.includes(q);
    });
  }

  openNewRouteModal() {
    this.newFlight = {
      flightNumber: '6E-' + Math.floor(Math.random() * 8000 + 1000),
      airlineCode: '6E',
      originCode: 'DEL',
      destinationCode: 'BOM',
      basePrice: 4899,
      totalSeats: 180,
      cabinClass: 'ECONOMY'
    };
    this.showNewRouteModal = true;
    this.cdr.detectChanges();
  }

  submitCreateFlight() {
    if (!this.newFlight.flightNumber || !this.newFlight.basePrice) {
      this.toast.warning('Please enter valid flight details.');
      return;
    }

    this.adminService.createFlight(this.newFlight).subscribe({
      next: (created) => {
        this.toast.success(`Flight ${created.flightNumber} created and scheduled successfully!`);
        this.showNewRouteModal = false;
        this.refreshAllData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create flight');
      }
    });
  }

  changeFlightStatus(flight: Flight) {
    const statuses = ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'];
    const currentIdx = statuses.indexOf(flight.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    this.adminService.updateFlightStatus(flight.id, nextStatus).subscribe({
      next: (updated) => {
        this.toast.success(`Flight ${flight.flightNumber} status updated to ${nextStatus}`);
        flight.status = nextStatus as any;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('Failed to update status');
      }
    });
  }

  deleteFlight(id: number) {
    if (confirm('Are you sure you want to delete this flight from the schedule?')) {
      this.adminService.deleteFlight(id).subscribe({
        next: () => {
          this.toast.success('Flight deleted successfully');
          this.flights = this.flights.filter(f => f.id !== id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Could not delete flight');
        }
      });
    }
  }

  openAddAircraftModal() {
    this.newAircraft = {
      tailNumber: 'VT-' + Math.random().toString(36).substring(2, 5).toUpperCase(),
      model: 'Airbus A320neo',
      status: 'Operational'
    };
    this.showAddAircraftModal = true;
    this.cdr.detectChanges();
  }

  submitAddAircraft() {
    if (!this.newAircraft.tailNumber) {
      this.toast.warning('Please enter a valid tail number.');
      return;
    }

    this.fleetService.addAircraft(this.newAircraft).subscribe({
      next: (plane) => {
        this.toast.success(`Aircraft ${plane.tailNumber} added to fleet!`);
        this.showAddAircraftModal = false;
        this.refreshAllData();
        this.cdr.detectChanges();
      }
    });
  }

  toggleAircraftStatus(id: number) {
    this.fleetService.toggleStatus(id).subscribe({
      next: (updated) => {
        if (updated) {
          this.toast.success(`Aircraft ${updated.tailNumber} status changed to ${updated.status}`);
          this.refreshAllData();
          this.cdr.detectChanges();
        }
      }
    });
  }

  exportFleetReport() {
    const csvRows = ['Tail Number,Model,Status,Last Inspection,Hours Flown'];
    this.fleet.forEach(p => {
      csvRows.push(`${p.tailNumber},${p.model},${p.status},${p.lastInspection},${p.totalHoursFlown}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyFlow_Fleet_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    this.toast.success('Fleet Report CSV exported successfully!');
  }

  openSettingsModal() {
    this.showSettingsModal = true;
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.toast.info('Logged out from Admin Operations.');
    this.router.navigate(['/login']);
  }
}
