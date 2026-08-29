import { Component, OnInit, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightService } from '../../../services/flight.service';
import { Airport, FlightSearchRequest } from '../../../models/flight.model';

@Component({
  selector: 'app-search-with-filters-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-with-filters-form.component.html',
})
export class SearchWithFiltersFormComponent implements OnInit {
  @Output() search = new EventEmitter<FlightSearchRequest>();

  private flightService = inject(FlightService);

  airports: Airport[] = [];

  originCode = 'DEL';
  destinationCode = 'BOM';
  departureDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.flightService.getAirports().subscribe({
      next: (data: Airport[]) => (this.airports = data),
      error: () => (this.airports = [])
    });
  }

  onSubmit(): void {
    this.search.emit({
      originCode: this.originCode,
      destinationCode: this.destinationCode,
      departureDate: this.departureDate
    });
  }
}
