import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.apiUrl, request);
  }

  getMyBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/my`);
  }

  getBookingByPnr(pnr: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/pnr/${pnr}`);
  }

  cancelBooking(id: number): Observable<BookingResponse> {
    return this.http.put<BookingResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
