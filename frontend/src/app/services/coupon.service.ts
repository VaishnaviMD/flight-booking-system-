import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CouponResponse {
  code?: string;
  discountAmount: number;
  finalAmount: number;
  valid: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/coupons`;

  applyCoupon(code: string, amount: number): Observable<CouponResponse> {
    const params = new HttpParams()
      .set('code', code.trim())
      .set('amount', amount.toString());
    return this.http.get<CouponResponse>(`${this.apiUrl}/apply`, { params });
  }
}
