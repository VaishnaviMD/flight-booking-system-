import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIRLINES } from '../../../data/flight-data';

export interface FilterState {
  maxPrice: number;
  selectedAirlines: string[];
  stops: 'ALL' | 'NONSTOP' | 'ONE_STOP';
  sortBy: 'PRICE_LOW' | 'PRICE_HIGH' | 'DEPARTURE_TIME' | 'DURATION';
}

@Component({
  selector: 'app-flight-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flight-filter-panel.component.html',
})
export class FlightFilterPanelComponent {
  @Input() maxPriceLimit = 15000;

  @Output() filterChange = new EventEmitter<FilterState>();

  airlines = AIRLINES;

  state: FilterState = {
    maxPrice: 15000,
    selectedAirlines: [],
    stops: 'ALL',
    sortBy: 'PRICE_LOW'
  };

  onAirlineToggle(code: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.state.selectedAirlines.includes(code)) {
        this.state.selectedAirlines.push(code);
      }
    } else {
      this.state.selectedAirlines = this.state.selectedAirlines.filter(c => c !== code);
    }
    this.emitChange();
  }

  isAirlineSelected(code: string): boolean {
    return this.state.selectedAirlines.length === 0 || this.state.selectedAirlines.includes(code);
  }

  setStops(stops: 'ALL' | 'NONSTOP' | 'ONE_STOP'): void {
    this.state.stops = stops;
    this.emitChange();
  }

  emitChange(): void {
    this.filterChange.emit({ ...this.state });
  }

  resetFilters(): void {
    this.state = {
      maxPrice: this.maxPriceLimit,
      selectedAirlines: [],
      stops: 'ALL',
      sortBy: 'PRICE_LOW'
    };
    this.emitChange();
  }
}
