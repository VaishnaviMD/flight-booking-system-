import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private jwtHelper = new JwtHelperService();
  private http = inject(HttpClient);

  currentUser = signal<UserResponse | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('token'));

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap(res => this.setSession(res)));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap(res => this.setSession(res)));
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

  /** A session is valid only while its JWT has not expired. */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    if (authResult.user) {
      localStorage.setItem('user', JSON.stringify(authResult.user));
      this.currentUser.set(authResult.user);
    }
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

