import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { Flight, Airport } from '../../models/flight.model';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            <select [(ngModel)]="originCode">
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
            <select [(ngModel)]="destinationCode">
              <option value="">Select Destination</option>
              <option *ngFor="let a of airports" [value]="a.code">
                {{ a.city }} ({{ a.code }})
              </option>
            </select>
          </div>

          <!-- DEPARTURE Date -->
          <div class="form-group">
            <label>DEPARTURE</label>
            <input type="date" [(ngModel)]="departureDate" [min]="minDate" />
          </div>

          <!-- PASSENGERS -->
          <div class="form-group">
            <label>PASSENGERS</label>
            <input type="number" [(ngModel)]="passengers" min="1" max="9" />
          </div>

          <!-- STOPS Filter -->
          <div class="form-group">
            <label>STOPS</label>
            <select [(ngModel)]="stopsFilter">
              <option value="ANY">Any</option>
              <option value="NONSTOP">Non-stop</option>
              <option value="ONE_STOP">1 stop</option>
            </select>
          </div>

          <!-- SORT BY -->
          <div class="form-group">
            <label>SORT BY</label>
            <select [(ngModel)]="sortBy">
              <option value="PRICE_LOW">Lowest price</option>
              <option value="DEPARTURE_TIME">Departure time</option>
              <option value="DURATION">Duration</option>
            </select>
          </div>
        </div>

        <div class="panel-actions">
          <button (click)="executeSearch()" class="btn btn-primary search-action-btn">
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

      <!-- Flight Cards List (Matching Screenshots 1 & 3) -->
      <div class="flights-stack" *ngIf="!loading">
        <div *ngFor="let flight of filteredFlights" class="card flight-result-card">
          <div class="airline-column">
            <h4>{{ flight.airline.name }}</h4>
            <span class="flight-code">{{ flight.flightNumber }}</span>
          </div>

          <div class="times-column">
            <div class="time-block">
              <span class="time">{{ flight.departureTime | date:'HH:mm' }}</span>
              <span class="code">{{ flight.originAirport.code }}</span>
            </div>

            <div class="duration-box">
              <span class="dur">2h 10m</span>
              <div class="flight-line"></div>
              <span class="stop-tag" [class.nonstop]="stopsFilter !== 'ONE_STOP'">
                {{ stopsFilter === 'ONE_STOP' ? '1 stop' : 'Non-stop' }}
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
            </div>
            <button (click)="selectFlight(flight.id)" class="btn btn-primary select-btn">
              Select
            </button>
          </div>
        </div>

        <div *ngIf="filteredFlights.length === 0" class="card empty-flights">
          <span class="material-icons">flight_off</span>
          <h4>No flights to show yet. Hit Search above ✈</h4>
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
      grid-template-columns: 1.2fr auto 1.2fr 1fr 0.8fr 0.9fr 1.1fr;
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
      h4 { font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
      .flight-code { font-size: 0.85rem; color: var(--text-dim); }
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

      .price-val { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
      .seats-left { font-size: 0.75rem; color: var(--text-muted); }
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

  airports: Airport[] = [];
  flights: Flight[] = [];

  originCode = 'DEL';
  destinationCode = 'BOM';
  departureDate = new Date().toISOString().split('T')[0];
  passengers = 1;
  stopsFilter = 'ANY';
  sortBy = 'PRICE_LOW';

  loading = false;
  searched = true;

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
      this.executeSearch();
    });
  }

  swapAirports() {
    const temp = this.originCode;
    this.originCode = this.destinationCode;
    this.destinationCode = temp;
  }

  executeSearch() {
    this.loading = true;
    this.searched = true;

    this.flightService.searchFlights({
      originCode: this.originCode,
      destinationCode: this.destinationCode,
      departureDate: this.departureDate,
      passengers: this.passengers
    }).subscribe({
      next: data => {
        this.flights = data;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.flights = [];
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  resetSearch() {
    this.originCode = '';
    this.destinationCode = '';
    this.departureDate = '';
    this.passengers = 1;
    this.stopsFilter = 'ANY';
    this.executeSearch();
  }

  get filteredFlights(): Flight[] {
    let result = [...this.flights];

    if (this.stopsFilter === 'NONSTOP') {
      result = result.filter(f => f.id % 2 !== 0);
    } else if (this.stopsFilter === 'ONE_STOP') {
      result = result.filter(f => f.id % 2 === 0);
    }

    if (this.sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (this.sortBy === 'DEPARTURE_TIME') {
      result.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }

    return result;
  }

  getAirportCity(code: string): string {
    const found = this.airports.find(a => a.code === code);
    return found ? found.city : '';
  }

  selectFlight(flightId: number) {
    this.router.navigate([`/flight/${flightId}`]);
  }
}
