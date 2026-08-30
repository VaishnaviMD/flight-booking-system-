import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Airline, Airport, Flight, FlightSearchRequest } from '../models/flight.model';

/**
 * Maps the flat backend FlightResponse into the nested Flight model used
 * across the UI (flight.airline.name, flight.originAirport.city, …).
 */
export function mapFlightResponse(response: any): Flight {
  return {
    id: response.id,
    flightNumber: response.flightNumber,
    airline: {
      code: response.airlineCode,
      name: response.airlineName,
      logoUrl: response.airlineLogoUrl
    },
    originAirport: {
      code: response.originCode,
      name: response.originName,
      city: response.originCity,
      country: ''
    },
    destinationAirport: {
      code: response.destinationCode,
      name: response.destinationName,
      city: response.destinationCity,
      country: ''
    },
    departureTime: response.departureTime,
    arrivalTime: response.arrivalTime,
    durationMinutes: response.durationMinutes,
    stops: response.stops,
    basePrice: Number(response.basePrice),
    availableSeats: response.availableSeats,
    cabinClass: response.cabinClass,
    status: response.status,
    aircraftType: response.aircraftType,
    baggageCheckin: response.baggageCheckin,
    baggageCabin: response.baggageCabin,
    mealIncluded: response.mealIncluded,
    refundable: response.refundable,
    fareRules: response.fareRules
  };
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  private airportsCache$?: Observable<Airport[]>;
  private airlinesCache$?: Observable<Airline[]>;

  searchFlights(request: FlightSearchRequest): Observable<Flight[]> {
    let params = new HttpParams();
    if (request.originCode) params = params.set('origin', request.originCode);
    if (request.destinationCode) params = params.set('destination', request.destinationCode);
    if (request.departureDate) params = params.set('departureDate', request.departureDate);
    if (request.cabinClass) params = params.set('cabinClass', request.cabinClass);
    if (request.passengers != null) params = params.set('passengers', String(request.passengers));
    if (request.maxStops != null) params = params.set('maxStops', String(request.maxStops));
    if (request.airlineCode) params = params.set('airlineCode', request.airlineCode);
    if (request.minPrice != null) params = params.set('minPrice', String(request.minPrice));
    if (request.maxPrice != null) params = params.set('maxPrice', String(request.maxPrice));
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDir) params = params.set('sortDir', request.sortDir);

    return this.http.get<any[]>(`${this.apiUrl}/flights/search`, { params })
      .pipe(map(flights => flights.map(mapFlightResponse)));
  }

  getFlightById(id: number): Observable<Flight> {
    return this.http.get<any>(`${this.apiUrl}/flights/${id}`)
      .pipe(map(f => mapFlightResponse(f)));
  }

  getAirports(): Observable<Airport[]> {
    if (!this.airportsCache$) {
      this.airportsCache$ = this.http.get<Airport[]>(`${this.apiUrl}/airports`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.airportsCache$;
  }

  getAirlines(): Observable<Airline[]> {
    if (!this.airlinesCache$) {
      this.airlinesCache$ = this.http.get<Airline[]>(`${this.apiUrl}/airlines`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.airlinesCache$;
  }
}
