import { Component, OnInit, inject } from '@angular/core';
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

  activeTrips: BookingResponse[] = [];
  pastTrips: BookingResponse[] = [];
  loading = true;
  selectedTab: 'UPCOMING' | 'PAST' = 'UPCOMING';

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (bookings: BookingResponse[]) => {
        const now = new Date();
        this.activeTrips = bookings.filter((b: BookingResponse) => new Date(b.flight.departureTime) >= now && b.status === 'CONFIRMED');
        this.pastTrips = bookings.filter((b: BookingResponse) => new Date(b.flight.departureTime) < now || b.status === 'CANCELLED');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
