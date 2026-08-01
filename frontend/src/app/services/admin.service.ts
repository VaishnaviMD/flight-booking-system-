import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingResponse } from '../models/booking.model';
import { Flight } from '../models/flight.model';
import { UserResponse } from '../models/auth.model';

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
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/bookings`);
  }

  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.apiUrl}/flights`);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/users`);
  }
}
