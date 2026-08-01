import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '../../../models/flight.model';
import { FlightListComponent } from '../flight-list/flight-list.component';

@Component({
  selector: 'app-filtered-flight-list',
  standalone: true,
  imports: [CommonModule, FlightListComponent],
  templateUrl: './filtered-flight-list.component.html',
})
export class FilteredFlightListComponent {
  @Input() flights: Flight[] = [];
  @Input() loading = false;
  @Output() selectFlight = new EventEmitter<Flight>();

  onFlightSelect(flight: Flight): void {
    this.selectFlight.emit(flight);
  }
}
