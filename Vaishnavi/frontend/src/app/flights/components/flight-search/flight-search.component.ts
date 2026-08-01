import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIRPORTS } from '../../../data/flight-data';
import { FlightSearchRequest } from '../../../models/flight.model';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  @Output() search = new EventEmitter<FlightSearchRequest>();

  airports = AIRPORTS;

  originCode = '';
  destinationCode = '';
  departureDate = new Date().toISOString().split('T')[0];
  cabinClass = 'ECONOMY';
  passengers = 1;

  swapAirports(): void {
    const temp = this.originCode;
    this.originCode = this.destinationCode;
    this.destinationCode = temp;
  }

  onSearch(): void {
    this.search.emit({
      originCode: this.originCode,
      destinationCode: this.destinationCode,
      departureDate: this.departureDate,
      cabinClass: this.cabinClass,
      passengers: this.passengers
    });
  }

  reset(): void {
    this.originCode = '';
    this.destinationCode = '';
    this.departureDate = new Date().toISOString().split('T')[0];
    this.cabinClass = 'ECONOMY';
    this.passengers = 1;
    this.onSearch();
  }
}
