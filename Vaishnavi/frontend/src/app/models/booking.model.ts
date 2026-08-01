import { Flight } from './flight.model';
import { UserResponse } from './auth.model';

export interface PassengerRequest {
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  passportNumber?: string;
  seatNumber?: string;
  type?: string;
}

export interface BookingRequest {
  flightId: number;
  returnFlightId?: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  passengerCount?: number;
  passengers: PassengerRequest[];
}

export interface PassengerResponse {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  seatNumber?: string;
  ticketNumber: string;
}

export interface BookingResponse {
  id: number;
  pnr: string;
  user: UserResponse;
  flight: Flight;
  cabinClass: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  totalPrice: number;
  passengers: PassengerResponse[];
  createdAt: string;
}
