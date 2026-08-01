import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { Flight } from '../../models/flight.model';

@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container detail-page" *ngIf="flight">
      <a routerLink="/search" class="back-link">
        <span class="material-icons">arrow_back</span> Back to search
      </a>

      <!-- Hero Flight Detail Card (Matching Screenshot 2) -->
      <div class="card detail-hero-card">
        <div class="hero-top">
          <div>
            <span class="tag">FLIGHT DETAIL</span>
            <h2>{{ flight.airline.name }} {{ flight.flightNumber }}</h2>
            <p class="sub-route">{{ flight.originAirport.city }} to {{ flight.destinationAirport.city }} · Direct Flight</p>
          </div>
          <div class="price-hero">
            <span class="from-lbl">FROM</span>
            <span class="amount">₹{{ flight.basePrice }}</span>
          </div>
        </div>

        <div class="times-banner">
          <div class="time-box">
            <span class="time-large">{{ flight.departureTime | date:'HH:mm' }}</span>
            <span class="city-name">{{ flight.originAirport.code }}</span>
            <span class="gate-info">Jul 14, 2026 · T7 · Gate C18</span>
          </div>

          <div class="line-center">
            <span class="duration-text">2h 15m</span>
            <div class="line"></div>
            <span class="stop-info">Non-stop</span>
          </div>

          <div class="time-box">
            <span class="time-large">{{ flight.arrivalTime | date:'HH:mm' }}</span>
            <span class="city-name">{{ flight.destinationAirport.code }}</span>
            <span class="gate-info">Jul 14, 2026 · T2</span>
          </div>
        </div>
      </div>

      <!-- Grid Cards (Matching Screenshot 2) -->
      <div class="details-grid">
        <!-- Trip Metadata Card -->
        <div class="card meta-card">
          <h3>Trip Metadata</h3>
          <div class="grid-2">
            <div>
              <span class="label">AIRCRAFT</span>
              <strong>Airbus A330-300</strong>
            </div>
            <div>
              <span class="label">CABIN</span>
              <strong>{{ flight.cabinClass }}</strong>
            </div>
            <div>
              <span class="label">FARE FAMILY</span>
              <strong>Smart Flex</strong>
            </div>
            <div>
              <span class="label">REFUNDABLE</span>
              <strong>Yes</strong>
            </div>
          </div>
        </div>

        <!-- Passenger Details Card -->
        <div class="card meta-card">
          <h3>Passenger Details</h3>
          <div class="grid-2">
            <div>
              <span class="label">BAGGAGE</span>
              <strong>1 carry-on, 1 checked bag</strong>
            </div>
            <div>
              <span class="label">MEAL</span>
              <strong>Complimentary Hot Meal</strong>
            </div>
            <div>
              <span class="label">SEATS LEFT</span>
              <strong class="highlight-green">{{ flight.availableSeats }}</strong>
            </div>
            <div>
              <span class="label">ON-TIME</span>
              <strong>94.8%</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Fare Metadata Card -->
      <div class="card fare-card">
        <h3>Fare Metadata</h3>
        <div class="tags-row">
          <span class="badge-tag">🌱 623 kg CO2</span>
          <span class="badge-tag">📶 High-Speed Wi-Fi</span>
          <span class="badge-tag">🔌 Power Outlet at Seat</span>
        </div>
      </div>

      <div class="checkout-footer">
        <button (click)="proceedToBooking()" class="btn btn-primary btn-lg">
          Proceed to Checkout (₹{{ flight.basePrice }}) →
        </button>
      </div>
    </div>
  `,
  styles: [`
    .detail-page {
      padding: 36px 24px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--accent-color);
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    .detail-hero-card {
      margin-bottom: 24px;
      padding: 32px;
    }
    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .tag {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--accent-color);
    }
    .hero-top h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 4px 0;
    }
    .sub-route {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .price-hero {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .from-lbl { font-size: 0.75rem; color: var(--text-dim); }
    .amount { font-size: 2rem; font-weight: 800; color: var(--text-main); }

    .times-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #111a30;
      padding: 24px 36px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .time-box {
      display: flex;
      flex-direction: column;

      .time-large { font-size: 1.8rem; font-weight: 800; color: var(--text-main); }
      .city-name { font-size: 1.1rem; font-weight: 700; color: var(--accent-color); }
      .gate-info { font-size: 0.8rem; color: var(--text-dim); margin-top: 4px; }
    }
    .line-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 160px;

      .duration-text { font-size: 0.8rem; color: var(--text-muted); }
      .line { width: 100%; height: 2px; background: var(--border-color); margin: 6px 0; }
      .stop-info { font-size: 0.8rem; font-weight: 700; color: var(--accent-color); }
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .meta-card h3, .fare-card h3 {
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 20px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      .label { display: block; font-size: 0.75rem; color: var(--text-dim); font-weight: 800; margin-bottom: 4px; }
      strong { font-size: 0.95rem; }
    }
    .highlight-green { color: var(--accent-color); }
    .fare-card {
      margin-bottom: 32px;
    }
    .tags-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .badge-tag {
      background: #111a30;
      border: 1px solid var(--border-color);
      padding: 10px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.88rem;
    }
    .checkout-footer {
      display: flex;
      justify-content: flex-end;
    }
    .btn-lg {
      padding: 14px 32px;
      font-size: 1.1rem;
    }
  `]
})
export class FlightDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightService = inject(FlightService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  flight: Flight | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.flightService.getFlightById(id).subscribe({
        next: data => {
          this.flight = data;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  proceedToBooking() {
    if (this.flight) {
      this.router.navigate([`/booking/${this.flight.id}`]);
    }
  }
}
