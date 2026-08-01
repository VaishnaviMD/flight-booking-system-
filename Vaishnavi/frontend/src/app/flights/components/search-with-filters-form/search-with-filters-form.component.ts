import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIRPORTS } from '../../../data/flight-data';
import { FlightSearchRequest } from '../../../models/flight.model';

@Component({
  selector: 'app-search-with-filters-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-with-filters-form.component.html',
})
export class SearchWithFiltersFormComponent {
  @Output() search = new EventEmitter<FlightSearchRequest>();

  airports = AIRPORTS;

  originCode = 'DEL';
  destinationCode = 'BOM';
  departureDate = new Date().toISOString().split('T')[0];

  onSubmit(): void {
    this.search.emit({
      originCode: this.originCode,
      destinationCode: this.destinationCode,
      departureDate: this.departureDate
    });
  }
}
