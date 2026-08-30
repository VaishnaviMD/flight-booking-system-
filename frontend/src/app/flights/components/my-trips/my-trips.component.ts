import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { BookingResponse } from '../../../models/booking.model';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-trips.component.html',
})
export class MyTripsComponent implements OnInit {
  bookingService = inject(BookingService);
  cdr = inject(ChangeDetectorRef);

  activeTrips: BookingResponse[] = [];
  pastTrips: BookingResponse[] = [];
  loading = true;
  selectedTab: 'UPCOMING' | 'PAST' = 'UPCOMING';

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (bookings: BookingResponse[]) => {
        this.activeTrips = (bookings || []).filter((b: BookingResponse) => b.status === 'CONFIRMED' || b.status === 'PENDING');
        this.pastTrips = (bookings || []).filter((b: BookingResponse) => b.status === 'CANCELLED' || b.status === 'COMPLETED');
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
