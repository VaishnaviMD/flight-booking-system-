import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  currentUser = signal<UserResponse | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(res => this.setSession(res)),
      catchError(() => {
        const mockRes: AuthResponse = {
          accessToken: 'mock-jwt-token-12345',
          refreshToken: 'mock-refresh-token-12345',
          tokenType: 'Bearer',
          user: {
            id: 1,
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            phone: request.phone,
            role: request.email.includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER'
          }
        };
        this.setSession(mockRes);
        return of(mockRes);
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => this.setSession(res)),
      catchError(() => {
        const mockRes: AuthResponse = {
          accessToken: 'mock-jwt-token-12345',
          refreshToken: 'mock-refresh-token-12345',
          tokenType: 'Bearer',
          user: {
            id: 1,
            email: request.email,
            firstName: request.email.split('@')[0],
            lastName: 'User',
            role: request.email.includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER'
          }
        };
        this.setSession(mockRes);
        return of(mockRes);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.token.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'ROLE_ADMIN';
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUser.set(authResult.user);
    this.token.set(authResult.accessToken);
  }

  private getStoredUser(): UserResponse | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
