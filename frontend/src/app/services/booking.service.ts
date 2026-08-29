import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookingRequest, BookingResponse } from '../models/booking.model';
import { mapFlightResponse } from './flight.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private http = inject(HttpClient);

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<any>(this.apiUrl, request)
      .pipe(map(res => this.mapBooking(res)));
  }

  getMyBookings(): Observable<BookingResponse[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`)
      .pipe(map(list => list.map(b => this.mapBooking(b))));
  }

  getBookingByPnr(pnr: string): Observable<BookingResponse> {
    return this.http.get<any>(`${this.apiUrl}/pnr/${pnr}`)
      .pipe(map(res => this.mapBooking(res)));
  }

  getBookingById(id: number): Observable<BookingResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.mapBooking(res)));
  }

  cancelBooking(id: number): Observable<BookingResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(map(res => this.mapBooking(res)));
  }

  /**
   * The backend returns the flight nested as the flat FlightResponse DTO;
   * the UI model expects the nested airline/airport shape, so convert here.
   */
  private mapBooking(res: any): BookingResponse {
    return {
      id: res.id,
      pnr: res.pnr,
      status: res.status,
      cabinClass: res.cabinClass,
      totalPrice: Number(res.totalAmount ?? res.totalPrice ?? 0),
      totalAmount: res.totalAmount != null ? Number(res.totalAmount) : undefined,
      bookedAt: res.bookedAt,
      createdAt: res.createdAt ?? res.bookedAt,
      contactEmail: res.contactEmail,
      contactPhone: res.contactPhone,
      cancellationReason: res.cancellationReason,
      refundAmount: res.refundAmount != null ? Number(res.refundAmount) : undefined,
      cancelledAt: res.cancelledAt,
      flight: res.flight ? mapFlightResponse(res.flight) : (null as any),
      returnFlight: res.returnFlight ? mapFlightResponse(res.returnFlight) : undefined,
      passengers: (res.passengers ?? []).map((p: any) => ({ ...p }))
    };
  }
}
