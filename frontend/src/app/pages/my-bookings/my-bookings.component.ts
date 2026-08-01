import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../models/booking.model';
import { CancellationDialogComponent } from '../../components/cancellation-dialog/cancellation-dialog.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, CancellationDialogComponent],
  template: `
    <div class="container bookings-page">
      <!-- Upcoming Bookings Header -->
      <div class="page-title-box">
        <h2>Upcoming bookings</h2>
        <span class="active-count">{{ bookings.length }} active booking(s)</span>
      </div>

      <div *ngIf="loading" class="loading">Loading your itineraries...</div>

      <!-- Upcoming Bookings Cards -->
      <div class="bookings-stack" *ngIf="!loading">
        <div *ngFor="let b of bookings" class="card booking-card-v5">
          <div class="card-left-border" [class.cancelled-border]="b.status === 'CANCELLED'"></div>

          <div class="card-inner">
            <div class="top-row">
              <span class="badge" [ngClass]="{
                'badge-operational': b.status === 'CONFIRMED',
                'badge-danger': b.status === 'CANCELLED'
              }">
                {{ b.status === 'CANCELLED' ? 'CANCELLATION REQUESTED' : b.status }}
              </span>
            </div>

            <div class="main-info">
              <div class="dest-info">
                <h3>{{ b.flight.destinationAirport.city }}, {{ b.flight.destinationAirport.country }}</h3>
                <span class="dates-range">Oct 12 - Oct 24, 2026</span>
              </div>

              <div class="details-grid">
                <div>
                  <span class="lbl">AIRLINE</span>
                  <strong>{{ b.flight.airline.name }}</strong>
                </div>
                <div>
                  <span class="lbl">CONFIRMATION</span>
                  <strong class="pnr-highlight">{{ b.pnr }}</strong>
                </div>
                <div>
                  <span class="lbl">PASSENGERS</span>
                  <strong>{{ b.passengers.length }}</strong>
                </div>
                <div>
                  <span class="lbl">FARE</span>
                  <strong class="fare-amount">₹{{ b.totalPrice }}</strong>
                </div>
                <div>
                  <span class="lbl">REFUNDABLE</span>
                  <strong>Yes</strong>
                </div>
              </div>

              <div class="route-line-box">
                <div class="pt">
                  <strong>{{ b.flight.originAirport.code }}</strong>
                  <span>{{ b.flight.departureTime | date:'HH:mm' }}</span>
                </div>
                <div class="line"></div>
                <div class="pt">
                  <strong>{{ b.flight.destinationAirport.code }}</strong>
                  <span>{{ b.flight.arrivalTime | date:'HH:mm' }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="btn btn-outline btn-sm">View Itinerary</button>
                <button *ngIf="b.status === 'CONFIRMED'" (click)="openCancelDialog(b)" class="btn btn-danger btn-sm">
                  Cancel Booking
                </button>
                <button *ngIf="b.status === 'CANCELLED'" disabled class="btn btn-secondary btn-sm">
                  Cancellation Requested
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancellation Requests Section -->
      <div class="section-block">
        <span class="sec-tag">CANCELLATION</span>
        <h3>Cancellation requests</h3>
        <p class="sec-desc">Refunds are estimates until the carrier confirms the cancellation.</p>

        <div class="card refund-card">
          <div>
            <strong>Tokyo, Japan</strong>
            <span class="refund-sub">Changed travel plans · Submitted today</span>
          </div>
          <strong class="refund-amt">₹4,500</strong>
        </div>
      </div>

      <!-- Past Bookings Section -->
      <div class="section-block">
        <h3>Past bookings</h3>
        <p class="sec-desc">Completed journeys from your account.</p>

        <div class="past-stack">
          <div class="card past-card">
            <div class="past-left">
              <strong>Miami, FL</strong>
              <span class="sub">May 15 - May 18, 2026</span>
            </div>
            <div class="past-times">
              <span>10:20 AM JFK</span>
              <span class="badge badge-operational">Completed</span>
              <span>1:40 PM MIA</span>
            </div>
            <div class="past-right">
              <strong>₹8,450</strong>
              <button class="btn btn-outline btn-sm">Rebook</button>
            </div>
          </div>

          <div class="card past-card">
            <div class="past-left">
              <strong>Chicago, IL</strong>
              <span class="sub">Apr 02 - Apr 05, 2026</span>
            </div>
            <div class="past-times">
              <span>9:00 AM LGA</span>
              <span class="badge badge-operational">Completed</span>
              <span>10:45 AM ORD</span>
            </div>
            <div class="past-right">
              <strong>₹6,200</strong>
              <button class="btn btn-outline btn-sm">Rebook</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancellation Confirmation Dialog Modal Popup -->
      <app-cancellation-dialog
        [isOpen]="dialogOpen"
        [pnr]="selectedBooking?.pnr || ''"
        [totalPrice]="selectedBooking?.totalPrice || 0"
        (closed)="dialogOpen = false"
        (confirmed)="executeCancellation()">
      </app-cancellation-dialog>
    </div>
  `,
  styles: [`
    .bookings-page {
      padding: 40px 24px;
    }
    .page-title-box {
      margin-bottom: 28px;
      h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
      .active-count { font-size: 0.9rem; color: var(--text-muted); }
    }
    .bookings-stack {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 44px;
    }
    .booking-card-v5 {
      padding: 0;
      position: relative;
      overflow: hidden;
      display: flex;
    }
    .card-left-border {
      width: 6px;
      background: var(--accent-color);

      &.cancelled-border { background: #f59e0b; }
    }
    .card-inner {
      flex: 1;
      padding: 24px;
    }
    .top-row {
      margin-bottom: 12px;
    }
    .main-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .dest-info h3 {
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .dates-range {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 16px;
      background: #111a30;
      padding: 16px;
      border-radius: 10px;

      .lbl { display: block; font-size: 0.7rem; color: var(--text-dim); font-weight: 800; margin-bottom: 4px; }
      strong { font-size: 0.95rem; }
    }
    .pnr-highlight { color: var(--accent-color); }
    .fare-amount { font-size: 1.1rem; }
    .route-line-box {
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 320px;

      .pt { display: flex; flex-direction: column; strong { font-size: 1.1rem; } span { font-size: 0.75rem; color: var(--text-muted); } }
      .line { flex: 1; height: 2px; background: var(--border-color); }
    }
    .card-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    .section-block {
      margin-top: 40px;
      h3 { font-size: 1.3rem; margin-bottom: 4px; }
      .sec-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px; }
      .sec-tag { font-size: 0.7rem; font-weight: 800; color: #f59e0b; letter-spacing: 0.05em; }
    }
    .refund-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #111a30;

      .refund-sub { display: block; font-size: 0.8rem; color: var(--text-muted); }
      .refund-amt { font-size: 1.2rem; color: #f59e0b; }
    }
    .past-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .past-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #111a30;
    }
    .past-left strong { font-size: 1.1rem; display: block; }
    .past-left .sub { font-size: 0.8rem; color: var(--text-muted); }
    .past-times {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 0.85rem;
    }
    .past-right {
      display: flex;
      align-items: center;
      gap: 16px;

      strong { font-size: 1.1rem; }
    }
    .btn-sm { padding: 6px 14px; font-size: 0.85rem; }
  `]
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings: BookingResponse[] = [];
  loading = true;

  dialogOpen = false;
  selectedBooking: BookingResponse | null = null;

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openCancelDialog(b: BookingResponse) {
    this.selectedBooking = b;
    this.dialogOpen = true;
  }

  executeCancellation() {
    if (this.selectedBooking) {
      this.bookingService.cancelBooking(this.selectedBooking.id).subscribe(() => {
        this.dialogOpen = false;
        this.loadBookings();
      });
    }
  }
}
