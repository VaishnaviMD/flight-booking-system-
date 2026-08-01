export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  id: number;
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
  basePrice: number;
  availableSeats: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'IN_FLIGHT' | 'COMPLETED';
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
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
