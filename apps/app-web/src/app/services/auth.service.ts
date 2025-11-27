import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (user) {
      this.currentUserSignal.set(JSON.parse(user));
    }
    if (token) {
      this.tokenSignal.set(token);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if (response && response.access_token) {
          this.currentUserSignal.set(response.user);
          this.tokenSignal.set(response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('authToken', response.access_token);
        }
      })
    );
  }

  register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Observable<AuthResponse> {
    const registerData: RegisterRequest = {
      email,
      password,
    };
    if (firstName !== undefined) {
      registerData.firstName = firstName;
    }
    if (lastName !== undefined) {
      registerData.lastName = lastName;
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData).pipe(
      tap((response) => {
        if (response && response.access_token) {
          this.currentUserSignal.set(response.user);
          this.tokenSignal.set(response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('authToken', response.access_token);
        }
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSignal();
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshData: RefreshTokenRequest = {
      refresh_token: this.currentUserSignal()?.refresh_token || '',
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, refreshData).pipe(
      tap((response) => {
        if (response && response.access_token) {
          this.tokenSignal.set(response.access_token);
          localStorage.setItem('authToken', response.access_token);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    const forgotData: ForgotPasswordRequest = { email };
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, forgotData);
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    const resetData: ResetPasswordRequest = { token, password };
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, resetData);
  }
}
