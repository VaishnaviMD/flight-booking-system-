import { Flight } from './flight.model';

export interface PassengerRequest {
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  passportNumber?: string;
  mealPreference?: string;
  seatPreference?: string;
  specialAssistance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  seatNumber?: string;
  type?: string;
}

export interface BookingRequest {
  flightId: number;
  returnFlightId?: number;
  cabinClass: string;
  passengerCount?: number;
  contactEmail?: string;
  contactPhone?: string;
  passengers: PassengerRequest[];
}

export interface PassengerResponse {
  id: number;
  firstName: string;
  lastName: string;
  gender?: string;
  age?: number;
  nationality?: string;
  seatNumber?: string;
  passportNumber?: string;
  ticketNumber?: string;
  type?: string;
  mealPreference?: string;
  seatPreference?: string;
  specialAssistance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface BookingResponse {
  id: number;
  pnr: string;
  flight: Flight;
  returnFlight?: Flight;
  cabinClass: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  totalAmount?: number;
  bookedAt?: string;
  createdAt: string;
  contactEmail?: string;
  contactPhone?: string;
  cancellationReason?: string;
  refundAmount?: number;
  cancelledAt?: string;
  passengers: PassengerResponse[];
}
