import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FlightService } from '../../../services/flight.service';
import { Flight } from '../../../models/flight.model';

@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flight-detail.component.html',
})
export class FlightDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  flightService = inject(FlightService);

  flight: Flight | null = null;
  loading = true;

  ngOnInit(): void {
    const flightId = Number(this.route.snapshot.paramMap.get('id'));
    if (flightId) {
      this.flightService.getFlightById(flightId).subscribe({
        next: (data: Flight) => {
          this.flight = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  proceedToBooking(): void {
    if (this.flight) {
      this.router.navigate(['/booking', this.flight.id]);
    }
  }
}
