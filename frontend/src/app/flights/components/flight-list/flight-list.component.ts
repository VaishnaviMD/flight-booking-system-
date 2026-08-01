import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '../../../models/flight.model';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-list.component.html',
})
export class FlightListComponent {
  @Input() flights: Flight[] = [];
  @Input() loading = false;
  @Output() selectFlight = new EventEmitter<Flight>();

  onSelect(flight: Flight): void {
    this.selectFlight.emit(flight);
  }
}
