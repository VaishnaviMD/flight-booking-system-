import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod: string;
  cardNumber?: string;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  processPayment(req: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, req);
  }
}
