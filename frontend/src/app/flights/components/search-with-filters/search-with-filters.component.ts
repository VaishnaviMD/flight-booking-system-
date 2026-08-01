import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlightService } from '../../../services/flight.service';
import { Flight, FlightSearchRequest } from '../../../models/flight.model';
import { FlightFilterPanelComponent, FilterState } from '../flight-filter-panel/flight-filter-panel.component';
import { FilteredFlightListComponent } from '../filtered-flight-list/filtered-flight-list.component';
import { SearchWithFiltersFormComponent } from '../search-with-filters-form/search-with-filters-form.component';

@Component({
  selector: 'app-search-with-filters',
  standalone: true,
  imports: [
    CommonModule,
    SearchWithFiltersFormComponent,
    FlightFilterPanelComponent,
    FilteredFlightListComponent
  ],
  templateUrl: './search-with-filters.component.html',
})
export class SearchWithFiltersComponent implements OnInit {
  flightService = inject(FlightService);
  router = inject(Router);

  rawFlights: Flight[] = [];
  displayedFlights: Flight[] = [];
  loading = true;

  currentFilterState: FilterState = {
    maxPrice: 15000,
    selectedAirlines: [],
    stops: 'ALL',
    sortBy: 'PRICE_LOW'
  };

  ngOnInit(): void {
    this.executeSearch({});
  }

  executeSearch(request: FlightSearchRequest): void {
    this.loading = true;
    this.flightService.searchFlights(request).subscribe({
      next: (data: Flight[]) => {
        this.rawFlights = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(state: FilterState): void {
    this.currentFilterState = state;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.rawFlights];

    // Max Price
    if (this.currentFilterState.maxPrice) {
      result = result.filter(f => f.basePrice <= this.currentFilterState.maxPrice);
    }

    // Airlines
    if (this.currentFilterState.selectedAirlines && this.currentFilterState.selectedAirlines.length > 0) {
      result = result.filter(f => this.currentFilterState.selectedAirlines.includes(f.airline?.code));
    }

    // Sort By
    if (this.currentFilterState.sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (this.currentFilterState.sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (this.currentFilterState.sortBy === 'DEPARTURE_TIME') {
      result.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }

    this.displayedFlights = result;
  }

  onFlightSelect(flight: Flight): void {
    this.router.navigate(['/booking', flight.id]);
  }
}
