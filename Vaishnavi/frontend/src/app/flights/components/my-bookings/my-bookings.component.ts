import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingService } from '../../../services/booking.service';
import { BookingResponse } from '../../../models/booking.model';
import { BookingCancellationModalComponent } from './booking-cancellation-modal.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, MatDialogModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: []
})
export class MyBookingsComponent implements OnInit {
  bookingService = inject(BookingService);
  dialog = inject(MatDialog);

  bookings: BookingResponse[] = [];
  loading = true;
  filterStatus: 'ALL' | 'CONFIRMED' | 'CANCELLED' = 'ALL';

  cancellationReasons = [
    'Change of travel plans',
    'Flight delayed or rescheduled',
    'Personal / Medical emergency',
    'Found a better alternative flight',
    'Duplicate booking created by error'
  ];

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data: BookingResponse[]) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredBookings(): BookingResponse[] {
    if (this.filterStatus === 'ALL') return this.bookings;
    return this.bookings.filter(b => b.status === this.filterStatus);
  }

  openCancellationModal(booking: BookingResponse): void {
    const dialogRef = this.dialog.open(BookingCancellationModalComponent, {
      width: '460px',
      data: {
        reasons: this.cancellationReasons,
        refundAmount: `₹${(booking.totalPrice * 0.85).toLocaleString('en-IN')}`
      }
    });

    dialogRef.afterClosed().subscribe((reason: string | undefined) => {
      if (reason) {
        this.cancelBooking(booking.id, reason);
      }
    });
  }

  cancelBooking(bookingId: number, reason: string): void {
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'CANCELLED';
        }
        alert(`Booking cancelled successfully. Reason: ${reason}`);
      },
      error: (err: any) => {
        alert(err?.error?.message || 'Could not process cancellation at this time.');
      }
    });
  }

  downloadTicket(pnr: string): void {
    alert(`Downloading e-Ticket for PNR: ${pnr}...`);
  }
}
