import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookingResponse } from '../models/booking.model';
import { Flight } from '../models/flight.model';
import { UserResponse } from '../models/auth.model';
import { mapFlightResponse } from './flight.service';

export interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalFlights: number;
  scheduledFlights: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private http = inject(HttpClient);

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings`)
      .pipe(map(list => list.map(b => ({
        ...b,
        totalPrice: Number(b.totalAmount ?? b.totalPrice ?? 0),
        flight: b.flight ? mapFlightResponse(b.flight) : (null as any)
      }))));
  }

  getAllFlights(): Observable<Flight[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flights`)
      .pipe(map(list => list.map(mapFlightResponse)));
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }
}
