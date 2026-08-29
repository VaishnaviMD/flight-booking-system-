export interface Airport {
  id?: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  id?: number;
  code: string;
  name: string;
  logoUrl?: string;
}

export interface Flight {
  id: number;
  flightNumber: string;
  airline: Airline;
  originAirport: Airport;
  destinationAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  basePrice: number;
  availableSeats: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
  // Flight metadata provided by the backend
  aircraftType?: string;
  baggageCheckin?: string;
  baggageCabin?: string;
  mealIncluded?: boolean;
  refundable?: boolean;
  fareRules?: string;
}

export interface FlightSearchRequest {
  originCode?: string;
  destinationCode?: string;
  departureDate?: string;
  cabinClass?: string;
  passengers?: number;
  minPrice?: number;
  maxPrice?: number;
  maxStops?: number;
  airlineCode?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
