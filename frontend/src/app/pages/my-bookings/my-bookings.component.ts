import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { BookingResponse } from '../../models/booking.model';
import { CancellationDialogComponent } from '../../components/cancellation-dialog/cancellation-dialog.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, CancellationDialogComponent],
  template: `
    <div class="container bookings-page">
      <!-- Active Bookings Header -->
      <div class="page-title-box">
        <h2>My Flight Bookings</h2>
        <span class="active-count">{{ activeBookings.length }} active booking(s)</span>
      </div>

      <div *ngIf="loading" class="loading">Loading your itineraries...</div>

      <!-- Active / Confirmed Bookings Cards -->
      <div class="bookings-stack" *ngIf="!loading">
        <div *ngFor="let b of activeBookings" class="card booking-card-v5">
          <div class="card-left-border" [class.cancelled-border]="b.status === 'CANCELLED'"></div>

          <div class="card-inner">
            <div class="top-row">
              <span class="badge badge-operational">
                {{ b.status }}
              </span>
              <span class="badge badge-on-time" *ngIf="b.flight.refundable !== false">REFUNDABLE</span>
              <span class="badge badge-warning" *ngIf="b.flight.refundable === false">NON-REFUNDABLE</span>
            </div>

            <div class="main-info">
              <div class="dest-info">
                <h3>{{ b.flight.destinationAirport.city }} ({{ b.flight.destinationAirport.code }})</h3>
                <span class="dates-range">{{ b.flight.departureTime | date:'EEE, MMM d, y' }} · {{ b.flight.flightNumber }}</span>
              </div>

              <div class="details-grid">
                <div>
                  <span class="lbl">AIRLINE</span>
                  <strong>{{ b.flight.airline.name }}</strong>
                </div>
                <div>
                  <span class="lbl">PNR / CONFIRMATION</span>
                  <strong class="pnr-highlight">{{ b.pnr }}</strong>
                </div>
                <div>
                  <span class="lbl">PASSENGERS</span>
                  <strong>{{ b.passengers.length }} traveller(s)</strong>
                </div>
                <div>
                  <span class="lbl">TOTAL FARE</span>
                  <strong class="fare-amount">₹{{ b.totalPrice }}</strong>
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
                <button (click)="openItinerary(b)" class="btn btn-outline btn-sm">
                  <span class="material-icons">receipt_long</span> View Itinerary
                </button>
                <button *ngIf="b.status === 'CONFIRMED'" (click)="openCancelDialog(b)" class="btn btn-danger btn-sm">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="activeBookings.length === 0 && !loading" class="card empty-flights">
          <span class="material-icons">flight_takeoff</span>
          <h4>No active bookings found.</h4>
          <p class="empty-sub">Search for flights from the Home page and book your next trip.</p>
        </div>
      </div>

      <!-- Cancellations Section -->
      <div class="section-block" *ngIf="cancelledBookings.length > 0">
        <span class="sec-tag">CANCELLATION</span>
        <h3>Cancelled Bookings</h3>
        <p class="sec-desc">Refunds are processed to the original payment method.</p>

        <div *ngFor="let b of cancelledBookings" class="card refund-card">
          <div>
            <strong>{{ b.flight.destinationAirport.city }} · PNR {{ b.pnr }}</strong>
            <span class="refund-sub">{{ b.cancellationReason || 'Cancelled by passenger' }} · {{ b.cancelledAt | date:'MMM d, y, HH:mm' }}</span>
          </div>
          <strong class="refund-amt">₹{{ (b.refundAmount ?? b.totalPrice * 0.8) | number:'1.0-0' }} refund</strong>
        </div>
      </div>

      <!-- Past Completed Bookings Section -->
      <div class="section-block" *ngIf="pastBookings.length > 0">
        <h3>Past Completed Journeys</h3>
        <p class="sec-desc">Past trips recorded on your account.</p>

        <div class="past-stack">
          <div *ngFor="let b of pastBookings" class="card past-card">
            <div class="past-left">
              <strong>{{ b.flight.destinationAirport.city }} · {{ b.flight.flightNumber }}</strong>
              <span class="sub">{{ b.flight.departureTime | date:'MMM d, y' }} · {{ b.flight.airline.name }}</span>
            </div>
            <div class="past-times">
              <span>{{ b.flight.departureTime | date:'HH:mm' }} {{ b.flight.originAirport.code }}</span>
              <span class="badge badge-operational">COMPLETED</span>
              <span>{{ b.flight.arrivalTime | date:'HH:mm' }} {{ b.flight.destinationAirport.code }}</span>
            </div>
            <div class="past-right">
              <strong>₹{{ b.totalPrice }}</strong>
              <button (click)="openItinerary(b)" class="btn btn-outline btn-sm">View Ticket</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Itinerary Details Modal Popup -->
      <div *ngIf="itineraryOpen && selectedBooking" class="modal-overlay" (click)="itineraryOpen = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-title">
              <span class="material-icons itinerary-icon">airplane_ticket</span>
              <h3>Flight Itinerary · PNR {{ selectedBooking.pnr }}</h3>
            </div>
            <button (click)="itineraryOpen = false" class="close-btn">✕</button>
          </div>

          <div class="modal-body">
            <div class="itin-route">
              <div class="pt">
                <strong>{{ selectedBooking.flight.departureTime | date:'HH:mm' }}</strong>
                <span>{{ selectedBooking.flight.originAirport.city }} ({{ selectedBooking.flight.originAirport.code }})</span>
              </div>
              <div class="line"></div>
              <div class="pt">
                <strong>{{ selectedBooking.flight.arrivalTime | date:'HH:mm' }}</strong>
                <span>{{ selectedBooking.flight.destinationAirport.city }} ({{ selectedBooking.flight.destinationAirport.code }})</span>
              </div>
            </div>

            <div class="itin-meta">
              <div>
                <span class="lbl">AIRLINE</span>
                <strong>{{ selectedBooking.flight.airline.name }} ({{ selectedBooking.flight.flightNumber }})</strong>
              </div>
              <div>
                <span class="lbl">CABIN</span>
                <strong>{{ selectedBooking.cabinClass }}</strong>
              </div>
              <div>
                <span class="lbl">DEPARTURE DATE</span>
                <strong>{{ selectedBooking.flight.departureTime | date:'mediumDate' }}</strong>
              </div>
              <div>
                <span class="lbl">TOTAL FARE PAID</span>
                <strong>₹{{ selectedBooking.totalPrice }}</strong>
              </div>
            </div>

            <h4 class="itin-sub">Passenger Details</h4>
            <table class="itin-table">
              <thead>
                <tr>
                  <th>PASSENGER</th>
                  <th>GENDER / AGE</th>
                  <th>NATIONALITY</th>
                  <th>TICKET NO</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of selectedBooking.passengers">
                  <td><strong>{{ p.firstName }} {{ p.lastName }}</strong></td>
                  <td>{{ p.gender || '-' }} / {{ p.age != null ? p.age : '-' }}</td>
                  <td>{{ p.nationality || 'Indian' }}</td>
                  <td><code>{{ p.ticketNumber || selectedBooking.pnr }}</code></td>
                </tr>
              </tbody>
            </table>

            <div class="itin-contact">
              <span class="lbl">CONTACT FOR UPDATES</span>
              <strong>{{ selectedBooking.contactEmail }} · {{ selectedBooking.contactPhone }}</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="printItinerary()" class="btn btn-outline btn-sm">
              <span class="material-icons">print</span> Print
            </button>
            <button (click)="itineraryOpen = false" class="btn btn-primary btn-sm">Close</button>
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
    .empty-flights {
      text-align: center;
      padding: 60px 24px;
      span { font-size: 40px; color: var(--text-dim); margin-bottom: 8px; }
      h4 { color: var(--text-muted); font-weight: 600; }
    }
    .empty-sub {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-top: 6px;
    }
    .badge-warning {
      background: rgba(245, 158, 11, 0.15);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* ---- Itinerary modal ---- */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .modal-card {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      padding: 18px 22px;
      background: #111a30;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      h3 { font-size: 1.05rem; margin: 0; }
    }
    .itinerary-icon { color: var(--accent-color); }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 1.1rem;
      cursor: pointer;
      &:hover { color: white; }
    }
    .modal-body { padding: 22px; }
    .modal-footer {
      padding: 14px 22px;
      background: #111a30;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .itin-route {
      display: flex;
      align-items: center;
      gap: 18px;
      background: #111a30;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 18px;

      .pt {
        display: flex;
        flex-direction: column;
        strong { font-size: 1.3rem; }
        span { font-size: 0.78rem; color: var(--text-muted); }
      }
      .line { flex: 1; height: 2px; background: var(--border-color); }
    }
    .itin-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 14px;
      margin-bottom: 18px;

      .lbl { display: block; font-size: 0.68rem; font-weight: 800; color: var(--text-dim); margin-bottom: 4px; letter-spacing: 0.05em; }
      strong { font-size: 0.9rem; }
    }
    .itin-sub {
      font-size: 0.95rem;
      margin-bottom: 10px;
    }
    .itin-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;

      th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.85rem;
      }
      th {
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--text-dim);
        letter-spacing: 0.05em;
      }
    }
    .itin-contact {
      .lbl { display: block; font-size: 0.68rem; font-weight: 800; color: var(--text-dim); margin-bottom: 4px; letter-spacing: 0.05em; }
      strong { font-size: 0.9rem; color: var(--accent-color); }
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  private errorDialog = inject(ErrorDialogService);
  private cdr = inject(ChangeDetectorRef);

  bookings: BookingResponse[] = [];
  loading = true;

  dialogOpen = false;
  itineraryOpen = false;
  selectedBooking: BookingResponse | null = null;

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.errorDialog.show(
          'Could not load bookings',
          err.error?.message || 'Please make sure you are logged in and try again.'
        );
      }
    });
  }

  /** All active/confirmed bookings associated with this account. */
  get activeBookings(): BookingResponse[] {
    return this.bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
  }

  /** Cancelled bookings shown with their refund estimate. */
  get cancelledBookings(): BookingResponse[] {
    return this.bookings.filter(b => b.status === 'CANCELLED');
  }

  /** Completed trips recorded on the account. */
  get pastBookings(): BookingResponse[] {
    return this.bookings.filter(b => b.status === 'COMPLETED');
  }

  openItinerary(b: BookingResponse) {
    this.selectedBooking = b;
    this.itineraryOpen = true;
    this.cdr.markForCheck();
  }

  /** Opens the browser print dialog for the currently viewed itinerary. */
  printItinerary() {
    window.print();
  }

  openCancelDialog(b: BookingResponse) {
    this.selectedBooking = b;
    this.dialogOpen = true;
    this.cdr.markForCheck();
  }

  executeCancellation() {
    if (!this.selectedBooking) return;
    const booking = this.selectedBooking;

    this.bookingService.cancelBooking(booking.id).subscribe({
      next: (res) => {
        this.dialogOpen = false;
        const refund = res.refundAmount ?? booking.totalPrice * 0.8;
        this.toast.success(
          `Booking ${res.pnr} cancelled. Estimated refund ₹${Math.round(refund)} will be processed to your original payment method.`
        );
        this.loadBookings();
      },
      error: (err) => {
        this.dialogOpen = false;
        this.cdr.markForCheck();
        this.errorDialog.show(
          'Cancellation failed',
          err.error?.message || 'Could not cancel this booking. Please try again.'
        );
      }
    });
  }
}
