import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import { Flight, Airport } from '../../models/flight.model';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  template: `
    <div class="container search-page">
      <!-- Search Filter Panel (Matching Screenshots 1 & 3) -->
      <div class="card search-panel">
        <div class="panel-header">
          <h2>Search Flights</h2>
          <p>Compare available flights and pick a fare for the selected route.</p>
        </div>

        <div class="search-controls-grid">
          <!-- FROM Selection -->
          <div class="form-group">
            <label>FROM</label>
            <select [(ngModel)]="originCode" name="originCode">
              <option value="">Select Origin</option>
              <option *ngFor="let a of airports" [value]="a.code">
                {{ a.city }} ({{ a.code }})
              </option>
            </select>
          </div>

          <!-- Swap Button -->
          <button (click)="swapAirports()" class="swap-btn" title="Swap Origin and Destination">
            <span class="material-icons">swap_horiz</span>
          </button>

          <!-- TO Selection -->
          <div class="form-group">
            <label>TO</label>
            <select [(ngModel)]="destinationCode" name="destinationCode">
              <option value="">Select Destination</option>
              <option *ngFor="let a of airports" [value]="a.code">
                {{ a.city }} ({{ a.code }})
              </option>
            </select>
          </div>

          <!-- DEPARTURE Date (today & future only) -->
          <div class="form-group">
            <label>DEPARTURE</label>
            <input type="date" [(ngModel)]="departureDate" name="departureDate" [min]="minDate" />
          </div>

          <!-- CABIN CLASS -->
          <div class="form-group">
            <label>CABIN</label>
            <select [(ngModel)]="cabinClass" name="cabinClass">
              <option value="">Any</option>
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>

          <!-- PASSENGERS -->
          <div class="form-group">
            <label>PASSENGERS</label>
            <input type="number" [(ngModel)]="passengers" name="passengers" min="1" max="9" />
          </div>

          <!-- STOPS Filter -->
          <div class="form-group">
            <label>STOPS</label>
            <select [(ngModel)]="stopsFilter" name="stopsFilter">
              <option value="ANY">Any</option>
              <option value="NONSTOP">Non-stop</option>
              <option value="ONE_STOP">1 stop</option>
            </select>
          </div>

          <!-- SORT BY -->
          <div class="form-group">
            <label>SORT BY</label>
            <select [(ngModel)]="sortBy" name="sortBy">
              <option value="PRICE_LOW">Lowest price</option>
              <option value="PRICE_HIGH">Highest price</option>
              <option value="DURATION">Fastest</option>
              <option value="DEPARTURE_TIME">Earliest departure</option>
              <option value="DEPARTURE_LATE">Latest departure</option>
            </select>
          </div>
        </div>

        <div class="panel-actions">
          <button (click)="executeSearch()" [disabled]="!canSearch()" class="btn btn-primary search-action-btn">
            <span class="material-icons">search</span> Search
          </button>
          <button (click)="resetSearch()" class="btn btn-outline">Reset</button>
        </div>

        <div class="search-summary-line" *ngIf="searched">
          Showing <strong>{{ getAirportCity(originCode) || 'All Origins' }} ({{ originCode || '*' }})</strong> 
          to <strong>{{ getAirportCity(destinationCode) || 'All Destinations' }} ({{ destinationCode || '*' }})</strong> 
          on <strong>{{ departureDate || 'Any Date' }}</strong> for <strong>{{ passengers }} passenger(s)</strong>
        </div>
      </div>

      <!-- Results Header Count -->
      <div class="results-header" *ngIf="!loading">
        <h3>{{ filteredFlights.length }} FLIGHT(S) FOUND</h3>
      </div>

      <!-- Loading Skeletons -->
      <div class="flights-stack" *ngIf="loading">
        <div *ngFor="let s of [1,2,3,4]" class="card flight-result-card skeleton-card">
          <app-skeleton width="120px" height="44px"></app-skeleton>
          <div class="skeleton-middle">
            <app-skeleton width="260px" height="14px"></app-skeleton>
            <app-skeleton width="180px" height="12px"></app-skeleton>
          </div>
          <div class="skeleton-right">
            <app-skeleton width="90px" height="28px"></app-skeleton>
            <app-skeleton width="100px" height="36px"></app-skeleton>
          </div>
        </div>
      </div>

      <!-- Flight Cards List (Matching Screenshots 1 & 3) -->
      <div class="flights-stack" *ngIf="!loading">
        <div *ngFor="let flight of filteredFlights" class="card flight-result-card">
          <div class="airline-column">
            <img *ngIf="flight.airline.logoUrl" [src]="flight.airline.logoUrl" [alt]="flight.airline.name" class="airline-logo" />
            <h4>{{ flight.airline.name }}</h4>
            <span class="flight-code">{{ flight.flightNumber }}</span>
            <span class="cabin-tag">{{ flight.cabinClass }}</span>
          </div>

          <div class="times-column">
            <div class="time-block">
              <span class="time">{{ flight.departureTime | date:'HH:mm' }}</span>
              <span class="code">{{ flight.originAirport.code }}</span>
            </div>

            <div class="duration-box">
              <span class="dur">{{ formatDuration(flight.durationMinutes) }}</span>
              <div class="flight-line"></div>
              <span class="stop-tag" [class.nonstop]="flight.stops === 0">
                {{ flight.stops === 0 ? 'Non-stop' : (flight.stops === 1 ? '1 stop' : flight.stops + ' stops') }}
              </span>
            </div>

            <div class="time-block">
              <span class="time">{{ flight.arrivalTime | date:'HH:mm' }}</span>
              <span class="code">{{ flight.destinationAirport.code }}</span>
            </div>
          </div>

          <div class="price-select-column">
            <div class="price-box">
              <span class="price-val">₹{{ flight.basePrice }}</span>
              <span class="seats-left">{{ flight.availableSeats }} seats left</span>
              <span class="refund-tag" [class.non-refundable]="!flight.refundable">
                {{ flight.refundable === false ? 'Non-refundable' : 'Refundable' }}
              </span>
            </div>
            <button (click)="selectFlight(flight.id)" class="btn btn-primary select-btn">
              Select
            </button>
          </div>
        </div>

        <div *ngIf="filteredFlights.length === 0" class="card empty-flights">
          <span class="material-icons">flight_off</span>
          <h4>No flights found for this route and date.</h4>
          <p class="empty-sub">Try a different date or route and search again.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page {
      padding: 36px 24px;
    }
    .search-panel {
      margin-bottom: 28px;
    }
    .panel-header {
      margin-bottom: 20px;
      h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-muted); font-size: 0.9rem; }
    }
    .search-controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 14px;
      align-items: end;
    }
    .swap-btn {
      height: 46px;
      width: 46px;
      border-radius: 50%;
      background: #1c2847;
      border: 1px solid var(--border-color);
      color: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 16px;
      transition: all 0.2s;

      &:hover {
        background: var(--accent-color);
        color: #0b1329;
      }
    }
    .search-action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
    .panel-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .search-action-btn {
      padding: 12px 28px;
    }
    .search-summary-line {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px dashed var(--border-color);
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .results-header {
      margin-bottom: 16px;
      h3 { font-size: 0.85rem; font-weight: 800; letter-spacing: 0.05em; color: var(--text-dim); }
    }
    .flights-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .flight-result-card {
      display: grid;
      grid-template-columns: 180px 1fr 180px;
      align-items: center;
      gap: 24px;
      padding: 24px 32px;
      background: var(--surface-bg);
      border-radius: 12px;
    }
    .airline-column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;

      h4 { font-size: 1.15rem; font-weight: 800; color: var(--text-main); }
      .flight-code { font-size: 0.85rem; color: var(--text-dim); }
      .airline-logo {
        width: 42px;
        height: 42px;
        object-fit: contain;
        border-radius: 8px;
        background: #ffffff;
        padding: 4px;
      }
      .cabin-tag {
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: var(--accent-color);
        background: var(--accent-glow);
        padding: 2px 8px;
        border-radius: 10px;
      }
    }
    .times-column {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
    }
    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center;

      .time { font-size: 1.4rem; font-weight: 800; color: var(--text-main); }
      .code { font-size: 0.8rem; color: var(--text-muted); font-weight: 700; }
    }
    .duration-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 140px;

      .dur { font-size: 0.75rem; color: var(--text-dim); }
      .flight-line {
        width: 100%;
        height: 2px;
        background: var(--border-color);
        margin: 6px 0;
      }
      .stop-tag {
        font-size: 0.75rem;
        font-weight: 700;
        color: #f59e0b;

        &.nonstop { color: var(--accent-color); }
      }
    }
    .price-select-column {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }
    .price-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;

      .price-val { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
      .seats-left { font-size: 0.75rem; color: var(--text-muted); }
      .refund-tag {
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--accent-color);

        &.non-refundable { color: #f59e0b; }
      }
    }
    .skeleton-card {
      min-height: 96px;
      align-items: center;
    }
    .skeleton-middle {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    .skeleton-right {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }
    .empty-sub {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-top: 6px;
    }
    .select-btn {
      padding: 8px 24px;
      font-size: 0.9rem;
    }
    .empty-flights {
      text-align: center;
      padding: 60px 24px;
      span { font-size: 40px; color: var(--text-dim); margin-bottom: 8px; }
      h4 { color: var(--text-muted); font-weight: 600; }
    }
  `]
})
export class FlightSearchComponent implements OnInit {
  private flightService = inject(FlightService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private errorDialog = inject(ErrorDialogService);

  airports: Airport[] = [];
  flights: Flight[] = [];

  originCode = 'DEL';
  destinationCode = 'BOM';
  departureDate = new Date().toISOString().split('T')[0];
  cabinClass = '';
  passengers = 1;
  stopsFilter = 'ANY';
  sortBy = 'PRICE_LOW';

  loading = false;
  searched = false;

  minDate = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.flightService.getAirports().subscribe(data => {
      this.airports = data;
      this.changeDetectorRef.markForCheck();
    });

    this.route.queryParams.subscribe(params => {
      if (params['originCode']) this.originCode = params['originCode'];
      if (params['destinationCode']) this.destinationCode = params['destinationCode'];
      if (params['departureDate']) this.departureDate = params['departureDate'];
      if (params['cabinClass']) this.cabinClass = params['cabinClass'];
      this.executeSearch();
    });
  }

  /** Search requires a full route + date — no wildcard searches against the API. */
  canSearch(): boolean {
    return !!(this.originCode && this.destinationCode && this.departureDate)
      && this.originCode !== this.destinationCode;
  }

  swapAirports() {
    const temp = this.originCode;
    this.originCode = this.destinationCode;
    this.destinationCode = temp;
  }

  executeSearch() {
    if (!this.canSearch()) {
      this.flights = [];
      this.searched = false;
      this.changeDetectorRef.markForCheck();
      return;
    }
    this.loading = true;
    this.searched = true;

    this.flightService.searchFlights({
      originCode: this.originCode,
      destinationCode: this.destinationCode,
      departureDate: this.departureDate,
      cabinClass: this.cabinClass,
      passengers: this.passengers
    }).subscribe({
      next: data => {
        this.flights = data;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (err) => {
        this.flights = [];
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        this.errorDialog.show(
          'Search failed',
          err.error?.message || 'Could not load flights. Please try again.'
        );
      }
    });
  }

  resetSearch() {
    this.originCode = '';
    this.destinationCode = '';
    this.departureDate = this.minDate;
    this.cabinClass = '';
    this.passengers = 1;
    this.stopsFilter = 'ANY';
    this.flights = [];
    this.searched = false;
    this.changeDetectorRef.markForCheck();
  }

  get filteredFlights(): Flight[] {
    let result = [...this.flights];

    // Sorting over the real API results (stops/cabin/price filters are
    // applied server-side; the stop tag on each card comes from the data).
    switch (this.sortBy) {
      case 'PRICE_HIGH':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'DURATION':
        result.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case 'DEPARTURE_TIME':
        result.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
        break;
      case 'DEPARTURE_LATE':
        result.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
        break;
      default:
        result.sort((a, b) => a.basePrice - b.basePrice);
    }

    return result;
  }

  formatDuration(minutes: number): string {
    if (!minutes && minutes !== 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getAirportCity(code: string): string {
    const found = this.airports.find(a => a.code === code);
    return found ? found.city : '';
  }

  selectFlight(flightId: number) {
    this.router.navigate([`/flight/${flightId}`]);
  }
}
