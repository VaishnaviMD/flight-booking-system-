import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { BookingService } from '../../services/booking.service';
import { PaymentService } from '../../services/payment.service';
import { HttpClient } from '@angular/common/http';
import { Flight } from '../../models/flight.model';
import { PassengerRequest } from '../../models/booking.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-modal-page" *ngIf="flight">
      <!-- Stepper Progress Bar -->
      <div class="stepper-bar">
        <div class="step completed">
          <span class="step-icon">✓</span>
          <span class="step-label">1. Flights</span>
        </div>
        <div class="step-line active"></div>
        <div class="step active">
          <span class="step-icon">2</span>
          <span class="step-label">2. Passengers</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <span class="step-icon">3</span>
          <span class="step-label">3. Extras</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <span class="step-icon">4</span>
          <span class="step-label">4. Payment</span>
        </div>
      </div>

      <div class="container checkout-layout">
        <!-- Left Column: Forms -->
        <main class="checkout-forms">
          <!-- Passenger Information Section -->
          <div class="card form-section">
            <h3><span class="material-icons title-icon">person</span> Passenger Information</h3>
            <p class="section-sub">Please enter details exactly as they appear on your travel documents.</p>

            <div *ngFor="let p of passengers; let i = index" class="passenger-block">
              <span class="passenger-title">ADULT {{ i + 1 }} (Primary Contact)</span>

              <div class="form-row grid-3">
                <div class="form-group">
                  <label>Title</label>
                  <select [(ngModel)]="p.title" name="title-{{i}}">
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="p.firstName" name="fn-{{i}}" placeholder="First Name">
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="p.lastName" name="ln-{{i}}" placeholder="Last Name">
                </div>
              </div>

              <div class="form-row grid-2">
                <div class="form-group">
                  <label>Date of Birth</label>
                  <input type="date" [(ngModel)]="p.dateOfBirth" name="dob-{{i}}">
                </div>
                <div class="form-group">
                  <label>Passenger Type</label>
                  <select [(ngModel)]="p.type" name="type-{{i}}">
                    <option value="ADULT">Adult</option>
                    <option value="CHILD">Child</option>
                    <option value="INFANT">Infant</option>
                  </select>
                </div>
              </div>

              <div class="form-row grid-2">
                <div class="form-group">
                  <label>Gender</label>
                  <select [(ngModel)]="p.gender" name="gender-{{i}}">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Passport Number</label>
                  <input type="text" [(ngModel)]="p.passportNumber" name="passport-{{i}}" placeholder="Passport Number">
                </div>
              </div>

              <div class="form-row grid-2">
                <div class="form-group">
                  <label>Seat Preference</label>
                  <input type="text" [(ngModel)]="p.seatNumber" name="seat-{{i}}" placeholder="e.g. 12A">
                </div>
                <div class="form-group">
                  <label>Age</label>
                  <input type="number" [(ngModel)]="p.age" name="age-{{i}}" min="0" placeholder="Age">
                </div>
              </div>

              <button *ngIf="passengers.length > 1" (click)="removePassenger(i)" class="btn btn-outline btn-sm remove-passenger-btn">
                Remove Passenger
              </button>
            </div>

            <!-- Extras Selection (Baggage & Seats) -->
            <div class="extras-grid">
              <div class="extra-box">
                <span class="material-icons icon">luggage</span>
                <div>
                  <h4>Baggage Options</h4>
                  <p>Add extra checked bags for your journey.</p>
                </div>
                <button class="btn btn-outline btn-sm">Select Baggage</button>
              </div>

              <div class="extra-box">
                <span class="material-icons icon">event_seat</span>
                <div>
                  <h4>Seat Selection</h4>
                  <p>Choose your preferred seat now.</p>
                </div>
                <button class="btn btn-outline btn-sm">Choose Seats</button>
              </div>
            </div>
          </div>

          <!-- Payment Information Section -->
          <div class="card form-section">
            <div class="section-header-row">
              <h3><span class="material-icons title-icon">credit_card</span> Payment Information</h3>
              <span class="badge-tag">SECURE MOCK PAYMENT</span>
            </div>

            <div class="info-alert">
              ℹ This is a simulated booking flow. No real charges will be made. Please enter any mock details.
            </div>

            <div class="form-group">
              <label>Card Number</label>
              <input type="text" [(ngModel)]="cardNumber" placeholder="0000 0000 0000 0000">
            </div>

            <div class="form-row grid-2">
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="text" [(ngModel)]="expiry" placeholder="MM/YY">
              </div>
              <div class="form-group">
                <label>CVC</label>
                <input type="text" [(ngModel)]="cvc" placeholder="123">
              </div>
            </div>

            <div class="form-group">
              <label>Name on Card</label>
              <input type="text" [(ngModel)]="cardName" placeholder="Cardholder Name">
            </div>
          </div>
        </main>

        <!-- Right Column: Trip Summary Sidebar -->
        <aside class="checkout-summary">
          <div class="card summary-card">
            <h3>Trip Summary</h3>
            <span class="sub-line">{{ passengers.length }} Passenger · {{ flight.cabinClass }}</span>

            <div class="summary-times">
              <div class="time-pt">
                <strong>{{ flight.departureTime | date:'HH:mm' }}</strong>
                <span>{{ flight.originAirport.city }} ({{ flight.originAirport.code }})</span>
              </div>
              <div class="line-center">
                <span>2h 15m</span>
                <div class="line"></div>
              </div>
              <div class="time-pt">
                <strong>{{ flight.arrivalTime | date:'HH:mm' }}</strong>
                <span>{{ flight.destinationAirport.city }} ({{ flight.destinationAirport.code }})</span>
              </div>
            </div>

            <div class="flight-chip">
              <span>Flight {{ flight.flightNumber }}</span>
            </div>

            <!-- Promo Coupon Application Box -->
            <div class="coupon-box">
              <span class="coupon-lbl">PROMO / COUPON CODE</span>
              <div class="coupon-input-group">
                <input type="text" [(ngModel)]="couponCode" placeholder="e.g. FLY500" />
                <button (click)="applyCoupon()" class="btn btn-secondary btn-sm">Apply</button>
              </div>
              <span *ngIf="couponMsg" class="coupon-msg" [class.success]="discountAmount > 0">{{ couponMsg }}</span>
            </div>

            <div class="cost-breakdown">
              <div class="cost-row">
                <span>1x Adult Ticket</span>
                <strong>₹{{ flight.basePrice * passengers.length }}</strong>
              </div>
              <div class="cost-row">
                <span>Taxes & Fees</span>
                <strong>₹399.00</strong>
              </div>
              <div *ngIf="discountAmount > 0" class="cost-row discount-row">
                <span>Coupon Discount</span>
                <strong class="discount-val">-₹{{ discountAmount }}</strong>
              </div>
              <div class="cost-row total-row">
                <span>Total</span>
                <strong class="total-green">₹{{ getFinalTotal() }}</strong>
              </div>
            </div>

            <button (click)="confirmBookingAndPay()" [disabled]="submitting" class="btn btn-primary pay-confirm-btn">
              {{ submitting ? 'Processing...' : 'Confirm & Pay' }}
            </button>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .checkout-modal-page {
      padding-bottom: 60px;
    }
    .stepper-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      background: #111a30;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 36px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-dim);

      &.active, &.completed {
        color: var(--accent-color);
        .step-icon { background: var(--accent-color); color: #0b1329; }
      }
    }
    .step-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1c2847;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
    }
    .step-line {
      width: 60px;
      height: 2px;
      background: var(--border-color);
      margin: 0 16px;

      &.active { background: var(--accent-color); }
    }
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 28px;
    }
    .form-section {
      margin-bottom: 24px;
      h3 { font-size: 1.2rem; display: flex; align-items: center; gap: 8px; }
      .title-icon { color: var(--accent-color); }
    }
    .section-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px; }
    .passenger-block {
      background: #111a30;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
    }
    .passenger-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--accent-color);
      letter-spacing: 0.05em;
      margin-bottom: 14px;
      display: block;
    }
    .form-row {
      display: grid;
      gap: 16px;
      &.grid-3 { grid-template-columns: 1fr 1.5fr 1.5fr; }
      &.grid-2 { grid-template-columns: 1fr 1fr; }
    }
    .extras-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 20px;
    }
    .extra-box {
      background: #111a30;
      border: 1px solid var(--border-color);
      padding: 16px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .icon { color: var(--accent-color); font-size: 24px; }
      h4 { font-size: 0.95rem; margin: 0; }
      p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
    }
    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .badge-tag {
      background: rgba(0, 220, 130, 0.1);
      color: var(--accent-color);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 800;
    }
    .info-alert {
      background: #182547;
      border-left: 3px solid var(--accent-color);
      padding: 12px 16px;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .summary-card {
      h3 { font-size: 1.2rem; margin-bottom: 4px; }
      .sub-line { font-size: 0.8rem; color: var(--text-dim); display: block; margin-bottom: 20px; }
    }
    .summary-times {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .time-pt {
      display: flex;
      flex-direction: column;
      strong { font-size: 1.1rem; }
      span { font-size: 0.75rem; color: var(--text-muted); }
    }
    .line-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;
      span { font-size: 0.7rem; color: var(--text-dim); }
      .line { width: 100%; height: 1px; background: var(--border-color); margin-top: 4px; }
    }
    .flight-chip {
      background: #111a30;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 20px;
    }
    .coupon-box {
      background: #111a30;
      border: 1px solid var(--border-color);
      padding: 14px;
      border-radius: 10px;
      margin-bottom: 20px;

      .coupon-lbl { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-dim); margin-bottom: 8px; }
    }
    .coupon-input-group {
      display: flex;
      gap: 8px;

      input {
        flex: 1;
        padding: 8px 12px;
        background: #0b1329;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: white;
        text-transform: uppercase;
        font-weight: 700;
        font-size: 0.85rem;
      }
    }
    .coupon-msg {
      display: block;
      font-size: 0.75rem;
      margin-top: 8px;
      color: #ef4444;

      &.success { color: var(--accent-color); }
    }
    .cost-breakdown {
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .cost-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-muted);

      &.discount-row { color: var(--accent-color); font-weight: 700; }
      &.total-row {
        border-top: 1px dashed var(--border-color);
        padding-top: 12px;
        font-size: 1.2rem;
        color: var(--text-main);
      }
    }
    .discount-val { color: var(--accent-color); }
    .total-green { color: var(--accent-color); font-weight: 800; }
    .pay-confirm-btn {
      width: 100%;
      margin-top: 24px;
      height: 48px;
      font-size: 1.05rem;
    }
  `]
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightService = inject(FlightService);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private http = inject(HttpClient);
  private changeDetectorRef = inject(ChangeDetectorRef);

  flight: Flight | null = null;
  submitting = false;

  email = 'user@example.com';
  phone = '+1 555 0192';

  cardNumber = '0000 0000 0000 0000';
  expiry = '12/28';
  cvc = '123';
  cardName = 'Cardholder Name';

  couponCode = '';
  discountAmount = 0;
  couponMsg = '';

  passengers: PassengerRequest[] = [
    { title: 'Mr.', firstName: '', lastName: '', age: 26, gender: 'MALE', type: 'ADULT', passportNumber: '', seatNumber: '' }
  ];

  ngOnInit() {
    const flightId = Number(this.route.snapshot.paramMap.get('id'));
    if (flightId) {
      this.flightService.getFlightById(flightId).subscribe({
        next: data => {
          this.flight = data;
          this.changeDetectorRef.markForCheck();
        },
        error: () => this.changeDetectorRef.markForCheck()
      });
    }
  }

  applyCoupon() {
    if (!this.couponCode.trim()) return;
    const baseTotal = (this.flight ? this.flight.basePrice : 4500) + 399;

    this.http.get<any>(`http://localhost:8080/api/coupons/apply?code=${this.couponCode}&amount=${baseTotal}`).subscribe({
      next: (res) => {
        if (res.valid) {
          this.discountAmount = res.discountAmount;
          this.couponMsg = res.message;
        } else {
          this.discountAmount = 0;
          this.couponMsg = res.message;
        }
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        if (this.couponCode.toUpperCase() === 'FLY500') {
          this.discountAmount = 500;
          this.couponMsg = 'Coupon FLY500 applied! Saved ₹500';
        } else {
          this.discountAmount = 0;
          this.couponMsg = 'Invalid coupon code';
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  getFinalTotal(): number {
    const baseTotal = ((this.flight ? this.flight.basePrice : 4500) * this.passengers.length) + 399;
    return Math.max(0, baseTotal - this.discountAmount);
  }

  addPassenger(): void {
    this.passengers.push({ firstName: '', lastName: '', age: 0, gender: 'MALE', type: 'ADULT', passportNumber: '', seatNumber: '' });
  }

  removePassenger(index: number): void {
    this.passengers.splice(index, 1);
  }

  confirmBookingAndPay() {
    if (!this.flight) return;
    this.submitting = true;

    const bookingRequest = {
      flightId: this.flight.id,
      cabinClass: this.flight.cabinClass,
      passengerCount: this.passengers.length,
      passengers: this.passengers.map(p => ({
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        passportNumber: p.passportNumber,
        seatNumber: p.seatNumber,
        type: p.type
      }))
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (res) => {
        this.paymentService.processPayment({
          bookingId: res.id,
          amount: this.getFinalTotal(),
          paymentMethod: 'CREDIT_CARD',
          cardNumber: this.cardNumber
        }).subscribe({
          next: () => {
            alert(`🎉 Booking Confirmed!\nPNR: ${res.pnr}`);
            this.router.navigate(['/my-bookings']);
          },
          error: () => this.submitting = false
        });
      },
      error: () => this.submitting = false
    });
  }
}
