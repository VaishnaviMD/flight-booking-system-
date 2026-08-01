import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { Airport } from '../../models/flight.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hero-section">
      <div class="container hero-content">
        <h1>Explore The World With SkyFlow</h1>
        <p>Book domestic & international flights at the best rates.</p>

        <div class="card search-card">
          <form (ngSubmit)="onSearch()" class="search-form">
            <div class="form-group">
              <label>From</label>
              <select [(ngModel)]="originCode" name="originCode" required>
                <option value="">Select Origin</option>
                <option *ngFor="let airport of airports" [value]="airport.code">
                  {{ airport.city }} ({{ airport.code }}) - {{ airport.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>To</label>
              <select [(ngModel)]="destinationCode" name="destinationCode" required>
                <option value="">Select Destination</option>
                <option *ngFor="let airport of airports" [value]="airport.code">
                  {{ airport.city }} ({{ airport.code }}) - {{ airport.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Departure Date</label>
              <input type="date" [(ngModel)]="departureDate" name="departureDate">
            </div>

            <div class="form-group">
              <label>Class</label>
              <select [(ngModel)]="cabinClass" name="cabinClass">
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary search-btn">
              <span class="material-icons">search</span> Search Flights
            </button>
          </form>
        </div>
      </div>
    </div>

    <div class="container features-section">
      <h2>Why Choose SkyFlow?</h2>
      <div class="features-grid">
        <div class="card feature-card">
          <span class="material-icons feature-icon">bolt</span>
          <h3>Instant Booking</h3>
          <p>Real-time flight seat allocation connected to PostgreSQL backend.</p>
        </div>
        <div class="card feature-card">
          <span class="material-icons feature-icon">security</span>
          <h3>Secure Transactions</h3>
          <p>Protected by Spring Security and JWT authentication headers.</p>
        </div>
        <div class="card feature-card">
          <span class="material-icons feature-icon">support_agent</span>
          <h3>24/7 Support</h3>
          <p>Manage bookings, view PNR status, and handle cancellations anytime.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: var(--bg-gradient);
      color: white;
      padding: 60px 0 80px;
      text-align: center;
    }
    .hero-content h1 {
      font-size: 2.8rem;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .hero-content p {
      font-size: 1.1rem;
      color: #94a3b8;
      margin-bottom: 36px;
    }
    .search-card {
      text-align: left;
      color: var(--text-dark);
      padding: 32px;
    }
    .search-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }
    .search-btn {
      height: 48px;
      margin-bottom: 16px;
    }
    .features-section {
      padding: 60px 24px;
      text-align: center;
    }
    .features-section h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 36px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .feature-card {
      text-align: center;
      padding: 32px 24px;
    }
    .feature-icon {
      font-size: 40px;
      color: var(--accent-color);
      margin-bottom: 16px;
    }
  `]
})
export class HomeComponent implements OnInit {
  private flightService = inject(FlightService);
  private router = inject(Router);

  airports: Airport[] = [];
  originCode: string = '';
  destinationCode: string = '';
  departureDate: string = '';
  cabinClass: string = 'ECONOMY';

  ngOnInit() {
    this.flightService.getAirports().subscribe({
      next: (data) => this.airports = data,
      error: (err) => console.error('Failed to load airports', err)
    });
  }

  onSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        originCode: this.originCode,
        destinationCode: this.destinationCode,
        departureDate: this.departureDate,
        cabinClass: this.cabinClass
      }
    });
  }
}
