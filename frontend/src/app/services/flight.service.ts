import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Airline, Airport, Flight, FlightSearchRequest } from '../models/flight.model';

const MOCK_AIRPORTS: Airport[] = [
  { id: 1, code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  { id: 2, code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { id: 3, code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India' },
  { id: 4, code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { id: 5, code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { id: 6, code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India' }
];

const MOCK_AIRLINES: Airline[] = [
  { id: 1, code: '6E', name: 'IndiGo' },
  { id: 2, code: 'AI', name: 'Air India' },
  { id: 3, code: 'UK', name: 'Vistara' },
  { id: 4, code: 'SG', name: 'SpiceJet' },
  { id: 5, code: 'QP', name: 'Akasa Air' }
];

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private toFlight(response: any): Flight {
    return {
      id: response.id,
      flightNumber: response.flightNumber,
      airline: {
        id: 0,
        code: response.airlineCode,
        name: response.airlineName,
        logoUrl: response.airlineLogoUrl
      },
      originAirport: {
        id: 0,
        code: response.originCode,
        name: response.originName,
        city: response.originCity,
        country: ''
      },
      destinationAirport: {
        id: 0,
        code: response.destinationCode,
        name: response.destinationName,
        city: response.destinationCity,
        country: ''
      },
      departureTime: response.departureTime,
      arrivalTime: response.arrivalTime,
      basePrice: Number(response.basePrice),
      availableSeats: response.availableSeats,
      cabinClass: response.cabinClass as any,
      status: response.status as any
    };
  }

  searchFlights(request: FlightSearchRequest): Observable<Flight[]> {
    let params = new HttpParams();
    if (request.originCode) params = params.set('origin', request.originCode);
    if (request.destinationCode) params = params.set('destination', request.destinationCode);
    if (request.departureDate) params = params.set('departureDate', request.departureDate);
    if (request.cabinClass) params = params.set('cabinClass', request.cabinClass);
    if (request.passengers != null) params = params.set('passengers', request.passengers.toString());

    if (request.maxStops != null) params = params.set('maxStops', request.maxStops.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDir) params = params.set('sortDir', request.sortDir);

    return this.http.get<any[]>(`${this.apiUrl}/flights/search`, { params }).pipe(
      map(flights => flights.map(f => this.toFlight(f))),
      catchError(() => of(this.generateMockFlights(request.originCode, request.destinationCode)))
    );
  }

  private generateMockFlights(originCode?: string, destinationCode?: string): Flight[] {
    const origin = MOCK_AIRPORTS.find(a => a.code === originCode) || MOCK_AIRPORTS[0];
    const destination = MOCK_AIRPORTS.find(a => a.code === destinationCode) || MOCK_AIRPORTS[1];

    return [
      {
        id: 1,
        flightNumber: '6E-1001',
        airline: MOCK_AIRLINES[0],
        originAirport: origin,
        destinationAirport: destination,
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 7800000).toISOString(),
        basePrice: 4899,
        availableSeats: 23,
        cabinClass: 'ECONOMY',
        status: 'SCHEDULED'
      },
      {
        id: 2,
        flightNumber: 'AI-1002',
        airline: MOCK_AIRLINES[1],
        originAirport: origin,
        destinationAirport: destination,
        departureTime: new Date(Date.now() + 98400000).toISOString(),
        arrivalTime: new Date(Date.now() + 98400000 + 8100000).toISOString(),
        basePrice: 5460,
        availableSeats: 12,
        cabinClass: 'ECONOMY',
        status: 'SCHEDULED'
      },
      {
        id: 3,
        flightNumber: 'UK-1003',
        airline: MOCK_AIRLINES[2],
        originAirport: origin,
        destinationAirport: destination,
        departureTime: new Date(Date.now() + 110400000).toISOString(),
        arrivalTime: new Date(Date.now() + 110400000 + 12300000).toISOString(),
        basePrice: 5120,
        availableSeats: 31,
        cabinClass: 'BUSINESS',
        status: 'SCHEDULED'
      },
      {
        id: 4,
        flightNumber: 'SG-1004',
        airline: MOCK_AIRLINES[3],
        originAirport: origin,
        destinationAirport: destination,
        departureTime: new Date(Date.now() + 125000000).toISOString(),
        arrivalTime: new Date(Date.now() + 125000000 + 8100000).toISOString(),
        basePrice: 4390,
        availableSeats: 8,
        cabinClass: 'ECONOMY',
        status: 'SCHEDULED'
      },
      {
        id: 5,
        flightNumber: 'QP-1005',
        airline: MOCK_AIRLINES[4],
        originAirport: origin,
        destinationAirport: destination,
        departureTime: new Date(Date.now() + 140000000).toISOString(),
        arrivalTime: new Date(Date.now() + 140000000 + 7800000).toISOString(),
        basePrice: 4725,
        availableSeats: 26,
        cabinClass: 'ECONOMY',
        status: 'SCHEDULED'
      }
    ];
  }

  getFlightById(id: number): Observable<Flight> {
    return this.http.get<any>(`${this.apiUrl}/flights/${id}`).pipe(
      map(f => this.toFlight(f)),
      catchError(() => of(this.generateMockFlights()[0]))
    );
  }

  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(`${this.apiUrl}/airports`).pipe(
      catchError(() => of(MOCK_AIRPORTS))
    );
  }

  getAirlines(): Observable<Airline[]> {
    return this.http.get<Airline[]>(`${this.apiUrl}/airlines`).pipe(
      catchError(() => of(MOCK_AIRLINES))
    );
  }
}
